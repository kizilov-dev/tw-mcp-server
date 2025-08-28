import { appsApiClient } from "../api";

export const getVcsProvidersAction = async ()=> {
  try {
    console.log("🔍 Запрос к API для получения списка VCS провайдеров...");

    const response = await appsApiClient.getVcsProviders();

    console.log('ответ от апи', response);

    console.log(
      `✅ Получено ${response?.providers?.length || 0} VCS провайдеров`
    );

    return response;
  } catch (error) {
    console.error("❌ Ошибка при получении списка VCS провайдеров:", error);

    // Проверяем тип ошибки для более информативного сообщения
    if (error instanceof Error) {
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        throw new Error("❌ Ошибка авторизации: проверьте TIMEWEB_TOKEN");
      }
      if (
        error.message.includes("403") ||
        error.message.includes("Forbidden")
      ) {
        throw new Error("❌ Доступ запрещен: проверьте права доступа токена");
      }
      if (error.message.includes("404")) {
        throw new Error("❌ API endpoint не найден");
      }
      if (error.message.includes("500")) {
        throw new Error("❌ Внутренняя ошибка сервера Timeweb Cloud");
      }
      if (error.message.includes("Network Error")) {
        throw new Error("❌ Ошибка сети: проверьте подключение к интернету");
      }
      if (error.message.includes("timeout")) {
        throw new Error("❌ Превышено время ожидания ответа от API");
      }
    }

    throw error;
  }
};
