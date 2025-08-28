import { z } from "zod";
import { createToolResponse } from "../utils";
import { AddVcsProviderRequestDto } from "../types/dto/add-vcs-provider-request.dto";
import { addVcsProviderAction } from "../actions/add-vcs-provider.action";
import { ToolNames } from "../types/tool-names.enum";

const inputSchema = {
  url: z
    .string({
      description:
        "URL репозитория (например: https://github.com/username/repo.git)",
    })
    .url("URL должен быть валидным"),
  login: z
    .string({ // TODO: проверить с приватными репозиториями
      description: "Логин для доступа к репозиторию (если репозиторий приватный)",
    })
    .optional(),
  password: z
    .string({
      description:
        "Пароль или токен для доступа к репозиторию (если репозиторий приватный)",
    })
    .optional(),
};

const handler = async (params: AddVcsProviderRequestDto) => {
  try {
    console.log("🚀 Добавление VCS провайдера...");
    console.log("📋 Параметры:", JSON.stringify(params, null, 2));

    await addVcsProviderAction(params);
    // Заглушка - возвращаем успешный ответ
    return createToolResponse(`✅ VCS провайдер успешно добавлен!

📋 Детали провайдера:
• Тип: git
• URL: ${params.url}
${params.login ? `• Логин: ${params.login}` : ""}
${params.password ? `• Пароль/токен: ***` : ""}

🎉 Провайдер готов к использованию!`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors
        .map((e) => `• ${e.path.join(".")}: ${e.message}`)
        .join("\n");

      throw new Error(`❌ Ошибка валидации данных:\n${validationErrors}`);
    }

    if (error instanceof Error) {
      throw new Error(
        `❌ Ошибка при добавлении VCS провайдера: ${error.message}`
      );
    }

    throw new Error(`❌ Неизвестная ошибка: ${String(error)}`);
  }
};

export const addVcsProviderTool = {
  name: ToolNames.ADD_VCS_PROVIDER,
  title: "Добавление VCS провайдера",
  description: "Добавляет новый VCS провайдер (github, gitlab, bitbucket, git)",
  inputSchema,
  handler,
};
