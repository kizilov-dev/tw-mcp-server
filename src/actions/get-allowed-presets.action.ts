import { appsApiClient } from "../api";

export const getAllowedPresetsAction = async () => {
  try {
    console.log("🔍 Запрос к API для получения доступных пресетов...");

    const response = await appsApiClient.getAllowedPresets();

    console.log("✅ Пресеты успешно получены");

    return response;
  } catch (error) {
    console.error("❌ Ошибка при получении пресетов:", error);
    throw error;
  }
};
