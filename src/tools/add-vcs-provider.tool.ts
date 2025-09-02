import { z } from "zod";
import { createToolResponse } from "../utils";
import { AddVcsProviderRequestDto } from "../types/dto/add-vcs-provider-request.dto";
import { addVcsProviderAction } from "../actions/add-vcs-provider.action";
import { ToolNames } from "../types/tool-names.enum";
import { VcsProviders } from "../types/vcs-providers.enum";

const inputSchema = {
  url: z
    .string({
      description: `URL репозитория в формате HTTPS. Пример https://github.com/username/repo.git. АВТОМАТИЧЕСКИ определить из .git/config если не указано явно`,
    })
    .url("URL должен быть валидным"),
  login: z
    .string({
      description: `ЛОГИН ДЛЯ ДОСТУПА К РЕПОЗИТОРИЮ.
        🔒 ОБЯЗАТЕЛЬНО для приватных репозиториев!

        Если при добавлении провайдера возникнет ошибка авторизации:
        • Запросить логин и пароль/токен у пользователя
        • Если ошибка авторизации - ПЕРЕЗАПРОСИТЬ с новыми данными`,
    })
    .optional(),
  password: z
    .string({
      description: `ПАРОЛЬ ИЛИ ТОКЕН ДЛЯ ДОСТУПА К РЕПОЗИТОРИЮ.
        🔒 ОБЯЗАТЕЛЬНО для приватных репозиториев!

        Варианты:
        • Personal Access Token (рекомендуется)
        • Пароль аккаунта

        Если при добавлении провайдера возникнет ошибка авторизации:
        • Запросить токен/пароль у пользователя
        • Если ошибка авторизации - ПЕРЕЗАПРОСИТЬ с новыми данными`,
    })
    .optional(),
  provider_type: z.nativeEnum(VcsProviders, {
    description: "Тип VCS провайдера",
  }),
};

const outputSchema = {
  provider: z.string({
    description: "Тип VCS провайдера. Всегда git",
  }),
  provider_id: z.string({
    description: "ID провайдера в Timeweb Cloud",
  }),
  login: z.string({
    description: "Название репозитория в Timeweb Cloud",
  }),
};

const handler = async (params: AddVcsProviderRequestDto) => {
  try {

    if (!params.provider_type) {
      return createToolResponse(
        `❌ Не указан тип VCS провайдера!`
      );
    }

    if (params.provider_type === VcsProviders.GIT) {
      await addVcsProviderAction(params);
    } else {
      // TODO: Добавить поддержку других провайдеров
      return createToolResponse(
        `❌ Не поддерживается тип VCS провайдера: используйте git для подключения по ссылке`
      );
    }


    return createToolResponse(`✅ VCS провайдер успешно добавлен!

📋 Детали провайдера:
• Тип: ${params.provider_type}
• URL: ${params.url}
${params.login ? `• Логин: ${params.login}` : ""}
${params.password ? `• Пароль/токен: ***` : ""}

🎉 Провайдер готов к использованию для деплоя приложений!`);
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      // Обработка ошибок авторизации
      if (
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("403") ||
        errorMessage.includes("401")
      ) {
        return createToolResponse(
          `❌ ОШИБКА АВТОРИЗАЦИИ при добавлении VCS провайдера!

🔍 Причина: Недостаточно прав доступа или неверные учетные данные

💡 РЕШЕНИЕ: Проверьте правильность логина и токена/пароля

🔄 НЕОБХОДИМО ПЕРЕЗАПРОСИТЬ ДАННЫЕ:
• Логин (username)
• Пароль/токен с необходимыми правами доступа

Детали ошибки: ${error.message}`
        );
      }

      // Обработка ошибок репозитория
      if (
        errorMessage.includes("repository not found") ||
        errorMessage.includes("404") ||
        errorMessage.includes("not found")
      ) {
        return createToolResponse(
          `❌ РЕПОЗИТОРИЙ НЕ НАЙДЕН!

🔍 Причина: Репозиторий не существует или недоступен

💡 РЕШЕНИЕ:
• Проверьте правильность URL репозитория
• Убедитесь, что репозиторий существует
• Проверьте права доступа к репозиторию

Текущий URL: ${params.url}`
        );
      }

      // Общая ошибка
      return createToolResponse(
        `❌ Ошибка при добавлении VCS провайдера!

🔍 Детали ошибки: ${error.message}

💡 Для приватных репозиториев убедитесь, что:
• Указан корректный логин
• Указан валидный токен/пароль с правами доступа
• Токен имеет необходимые scope (repo, read/write)`
      );
    }

    return createToolResponse(
      `❌ Неизвестная ошибка при добавлении VCS провайдера. Попробуйте еще раз.`
    );
  }
};

export const addVcsProviderTool = {
  name: ToolNames.ADD_VCS_PROVIDER,
  title: "Добавление VCS провайдера",
  description: `Добавляет новый VCS провайдер для подключения Git репозиториев к Timeweb Cloud`,
  inputSchema,
  outputSchema,
  handler,
};
