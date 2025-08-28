import { z } from "zod";
import { createToolResponse } from "../utils";
import { ToolNames } from "../types/tool-names.enum";
import { getVcsProviderRepositoriesAction } from "../actions/get-vcs-provider-repositories.action";
import { GetVcsProviderRepositoriesRequestDto } from "../types/dto/get-vcs-provider-repositories-request.dto";

// Схема валидации входных данных с Zod
const inputSchema = {
  provider_id: z.string({
    description: "ID провайдера для получения списка репозиториев",
  }),
};

// Обработчик получения списка репозиториев VCS провайдера
const handler = async (params: GetVcsProviderRepositoriesRequestDto) => {
  try {
    console.log(
      `📋 Получение списка репозиториев для провайдера ${params.provider_id}...`
    );

    // Получаем реальные данные через API
    const repositories = await getVcsProviderRepositoriesAction(params.provider_id);

    if (!repositories || repositories.length === 0) {
      return createToolResponse(`📋 Список репозиториев для провайдера ${params.provider_id}:

💡 Репозитории не найдены

💡 Проверьте правильность ID провайдера или добавьте репозитории`);
    }

    // Форматируем ответ с реальными данными
    const repositoriesList = repositories
      .map(
        (repo) =>
          `🔹 ${repo.url} (ID: ${repo.id})`
      )
      .join("\n\n");

    return createToolResponse(`📋 Список репозиториев для провайдера ${params.provider_id}:

${repositoriesList}

💡 Всего репозиториев: ${repositories.length}

🎉 Список репозиториев успешно получен!`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors
        .map((e) => `• ${e.path.join(".")}: ${e.message}`)
        .join("\n");

      throw new Error(`❌ Ошибка валидации данных:\n${validationErrors}`);
    }

    if (error instanceof Error) {
      throw new Error(
        `❌ Ошибка при получении списка репозиториев: ${error.message}`
      );
    }

    throw new Error(`❌ Неизвестная ошибка: ${String(error)}`);
  }
};

export const getVcsProviderRepositoriesTool = {
  name: ToolNames.GET_VCS_PROVIDER_REPOSITORIES,
  title: "Получение списка репозиториев VCS провайдера",
  description: "Получает список репозиториев VCS провайдера по ID",
  inputSchema,
  handler,
};
