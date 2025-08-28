import axios, { AxiosInstance } from "axios";
import { NoTokenException } from "../exeptions/no-token.exception";
import { ServerException } from "../exeptions/server.exception";

/**
 * Базовый HTTP клиент для Timeweb API
 */
export class BaseApiClient {
  private readonly token?: string;
  private readonly baseUrl: string;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.token = process.env.TIMEWEB_TOKEN || "";
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
  }

  checkToken(): void {
    if (!this.token) {
      throw new NoTokenException();
    }
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
      if (axios.isAxiosError(error)) {
        throw new ServerException(
          Array.isArray(error.message)
            ? error.message.join("\n")
            : error.message
        );
      }
      throw error;
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
}
