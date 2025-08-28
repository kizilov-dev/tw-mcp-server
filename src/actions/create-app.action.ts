import { appsApiClient } from "../api";
import { CreateAppParams } from "../types/create-app-params.type";
import { CreateAppRequestDto } from "../types/dto/create-app-request.dto";

export const createAppAction = async (params: CreateAppParams) => {
  const { repository_url, name, ...appParams } = params;

  // Получаем все провайдеры и ищем git провайдер
  console.log("Получение списка провайдеров...");
  const providersResponse = await appsApiClient.getVcsProviders();

  const providers = providersResponse?.providers || [];
  console.log("Получено провайдеров:", providers.length);

  if (!providers.length) {
    throw new Error("Провайдеры не найдены");
  }

  // Ищем git провайдер в поле provider
  const gitProvider = providers.find((p) => p.provider === "git");
  let providerId;

  if (!gitProvider) {
    console.log("Git провайдер не найден, создаем автоматически...");

    // Автоматически создаем git провайдер
    const addProviderData = {
      provider_type: "git",
      url: repository_url,
      login: "",
      password: "",
    };

    const addProviderResponse = await appsApiClient.addVcsProvider(
      addProviderData
    );

    console.log("Git провайдер успешно создан:", addProviderResponse);
    providerId = addProviderResponse?.provider?.provider_id;
  } else {
    providerId = gitProvider.provider_id;
    console.log("Найден существующий git провайдер:", providerId);
  }
  if (!providerId) {
    throw new Error("Git провайдер не найден");
  }
  
  // TODO: обработать кейс, когда репозиторий приватный

  // Получаем репозитории провайдера
  console.log("Получение репозиториев провайдера:", providerId);  
  const repositoriesResponse = await appsApiClient.getVcsProviderRepositories(
    providerId
  );

const repositories = repositoriesResponse?.repositories || [];
  const repository = repositories.find((repo) => repo.url === repository_url);

  if (!repository) {
    throw new Error(
      `Репозиторий ${repository_url} не найден у провайдера ${providerId}. Доступные репозитории: ${repositories
        .map((r) => r.url)
        .join(", ")}`
    );
  }

  console.log("Репозиторий найден");

  console.log(`🚀 Создание приложения "${name}"...`);
  console.log(
    `📋 Параметры:`,
    JSON.stringify({ ...appParams, repository_url, name }, null, 2)
  );

  // Добавляем найденные ID провайдера и репозитория к параметрам приложения
  const appCreationParams: CreateAppRequestDto = {
    ...appParams,
    name,
    provider_id: providerId,
    repository_id: repository.id,
    is_auto_deploy: false,
  };

  const response = await appsApiClient.createApp(appCreationParams);

  console.log("✅ Приложение успешно создано");

  return response?.data?.app || null;
};
