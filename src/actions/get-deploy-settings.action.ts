import { appsApiClient } from "../api";

export const getDeploySettingsAction = async () => {
  try {
    console.log("🔍 Запрос к API для получения настроек деплоя...");

    const response = await appsApiClient.getDeploySettings();

    console.log("✅ Настройки деплоя успешно получены");

    return response.default_deploy_settings;
  } catch (error) {
    console.error("❌ Ошибка при получении настроек деплоя:", error);
    throw error;
  }
};
