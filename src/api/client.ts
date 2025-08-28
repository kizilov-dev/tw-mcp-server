import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";

/**
 * Базовый HTTP клиент для Timeweb API
 */
export class BaseApiClient {
  private token?: string;
  private baseUrl: string;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.token = "";
    this.baseUrl = "https://timeweb.cloud";

    // Создаем экземпляр axios с базовой конфигурацией
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 секунд таймаут
    });

    // Добавляем интерцептор для логирования
    this.setupInterceptors();
  }

  checkToken(): void {
    if (!this.token) {
      throw new Error("❌ Не установлены переменные окружения TIMEWEB_TOKEN");
    }

    if (this.token.trim() === "") {
      throw new Error("❌ TIMEWEB_TOKEN установлен, но пустой");
    }

    if (this.token.length < 10) {
      throw new Error(
        "❌ TIMEWEB_TOKEN слишком короткий, проверьте корректность"
      );
    }
  }

  /**
   * Настройка интерцепторов для логирования
   */
  private setupInterceptors(): void {
    // Интерцептор запросов
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
        if (config.data) {
          console.log(
            "📤 Данные запроса:",
            JSON.stringify(config.data, null, 2)
          );
        }
        return config;
      },
      (error) => {
        console.error("❌ Ошибка в запросе:", error);
        return Promise.reject(error);
      }
    );

    // Интерцептор ответов
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(
          `✅ ${response.status} ${response.config.method?.toUpperCase()} ${
            response.config.url
          }`
        );
        if (response.data) {
          console.log(
            "📥 Данные ответа:",
            JSON.stringify(response.data, null, 2)
          );
        }
        return response;
      },
      (error: AxiosError) => {
        console.log("=== ОШИБКА ОТ API TIMEWEB ===");
        console.log("Статус HTTP:", error.response?.status);
        console.log("Заголовки:", error.response?.headers);
        console.log("Данные ошибки:", error.response?.data);
        console.log("Сообщение ошибки:", error.message);
        console.log("Код ошибки:", error.code);
        console.log("================================");
        return Promise.reject(error);
      }
    );
  }

  /**
   * Общий метод для выполнения API запросов
   */
  protected async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<T> {
    try {
      this.checkToken();

      const response = await this.axiosInstance.request({
        method,
        url: endpoint,
        data,
      });

      return response.data;
    } catch (error: any) {
      // Обрабатываем Axios ошибки
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const statusText = error.response?.statusText;
        const errorData = error.response?.data;

        let errorMessage = `API Error: ${status} ${statusText}`;

        if (errorData?.message) {
          errorMessage += ` - ${errorData.message}`;
        } else if (errorData?.error) {
          errorMessage += ` - ${errorData.error}`;
        } else if (errorData?.detail) {
          errorMessage += ` - ${errorData.detail}`;
        }

        // Добавляем дополнительную информацию в зависимости от статуса
        switch (status) {
          case 401:
            errorMessage += " (Проверьте TIMEWEB_TOKEN)";
            break;
          case 403:
            errorMessage += " (Проверьте права доступа токена)";
            break;
          case 404:
            errorMessage += " (API endpoint не найден)";
            break;
          case 429:
            errorMessage += " (Превышен лимит запросов)";
            break;
          case 500:
            errorMessage += " (Внутренняя ошибка сервера Timeweb Cloud)";
            break;
          case 502:
          case 503:
          case 504:
            errorMessage += " (Сервис временно недоступен)";
            break;
        }

        throw new Error(errorMessage);
      }

      // Обрабатываем другие ошибки
      if (error.code === "ECONNABORTED") {
        throw new Error("Превышено время ожидания ответа от API (30 сек)");
      }

      if (error.code === "ENOTFOUND") {
        throw new Error("Не удается разрешить домен api.timeweb.cloud");
      }

      if (error.code === "ECONNREFUSED") {
        throw new Error("Соединение с API отклонено");
      }

      throw new Error(`Network Error: ${error.message}`);
    }
  }

  /**
   * GET запрос
   */
  protected async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>("GET", endpoint);
  }

  /**
   * POST запрос
   */
  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>("POST", endpoint, data);
  }

  /**
   * PUT запрос
   */
  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>("PUT", endpoint, data);
  }

  /**
   * DELETE запрос
   */
  protected async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>("DELETE", endpoint);
  }

  /**
   * PATCH запрос
   */
  protected async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>("PATCH", endpoint, data);
  }

  /**
   * Получить базовый URL API
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}
export default BaseApiClient;
