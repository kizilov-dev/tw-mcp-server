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
    .string({
      // TODO: проверить с приватными репозиториями
      description:
        "Логин для доступа к репозиторию (если репозиторий приватный)",
    })
    .optional(),
  password: z
    .string({
      description:
        "Пароль или токен для доступа к репозиторию (если репозиторий приватный)",
    })
    .optional(),
  provider_type: z.enum(["git"], {
    description: "Тип VCS провайдера. Всегда git",
  }),
};

const handler = async (params: AddVcsProviderRequestDto) => {
  try {
    await addVcsProviderAction(params);

    return createToolResponse(`✅ VCS провайдер успешно добавлен!

📋 Детали провайдера:
• Тип: ${params.provider_type}
• URL: ${params.url}
${params.login ? `• Логин: ${params.login}` : ""}
${params.password ? `• Пароль/токен: ***` : ""}

🎉 Провайдер готов к использованию!`);
  } catch (error) {
    if (error instanceof Error) {
      return createToolResponse(
        `❌ Ошибка при добавлении VCS провайдера: ${error.message}`
      );
    }

    return createToolResponse(`❌ Неизвестная ошибка при добавлении VCS провайдера.`);
  }
};

export const addVcsProviderTool = {
  name: ToolNames.ADD_VCS_PROVIDER,
  title: "Добавление VCS провайдера",
  description: "Добавляет новый VCS провайдер",
  inputSchema,
  handler,
};
