import { z } from "zod";
import { createToolResponse } from "../utils";
import { getVcsProvidersAction } from "../actions/get-vcs-providers.action";
import { ToolNames } from "../types/tool-names.enum";

const inputSchema = {};

const handler = async () => {
  try {
    console.log("📋 Получение списка VCS провайдеров...");

    const providers = await getVcsProvidersAction();

    return createToolResponse(JSON.stringify(providers, null, 2));

//     if (!providers || providers.length === 0) {
//       return createToolResponse(`📋 Список VCS провайдеров:

// 💡 VCS провайдеры не найдены

// 💡 Добавьте первый провайдер с помощью tool 'add_vcs_provider'`);
//     }

//     // Форматируем ответ с реальными данными
//     const providersList = providers
//       .map(
//         (provider) =>
//           `🔹 ${provider.provider} провайдер (ID: ${provider.provider_id})`
//       )
//       .join("\n\n");

//     return createToolResponse(`📋 Список VCS провайдеров:

// ${providersList}

// 💡 Всего провайдеров: ${providers.length}

// 🎉 Список провайдеров успешно получен!`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors
        .map((e) => `• ${e.path.join(".")}: ${e.message}`)
        .join("\n");

      throw new Error(`❌ Ошибка валидации данных:\n${validationErrors}`);
    }

    if (error instanceof Error) {
      throw new Error(
        `❌ Ошибка при получении списка VCS провайдеров: ${error.message}`
      );
    }

    throw new Error(`❌ Неизвестная ошибка: ${String(error)}`);
  }
};

export const getVcsProvidersTool = {
  name: ToolNames.GET_VCS_PROVIDERS,
  title: "Получение списка VCS провайдеров",
  description: "Получает список всех добавленных VCS провайдеров",
  inputSchema,
  handler,
};
