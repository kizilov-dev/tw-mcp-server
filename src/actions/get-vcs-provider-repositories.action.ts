import { appsApiClient } from "../api";
import { VcsProviderRepository } from "../types/vcs-provider-repository.type";

export const getVcsProviderRepositoriesAction = async (
  providerId: string
): Promise<VcsProviderRepository[]> => {
  try {
    console.log(
      `🔍 Запрос к API для получения репозиториев провайдера ${providerId}...`
    );

    const response = await appsApiClient.getVcsProviderRepositories(providerId);

    console.log(
      `✅ Получено ${
        response?.repositories?.length || 0
      } репозиториев для провайдера ${providerId}`
    );

    return response?.repositories || [];
  } catch (error) {
    console.error(
      `❌ Ошибка при получении репозиториев провайдера ${providerId}:`,
      error
    );
    throw error;
  }
};
