import { PromptNames } from "../types/prompt-names.enum";
import { ToolNames } from "../types/tool-names.enum";

export const addVcsProviderPrompt = {
  name: PromptNames.ADD_VCS_PROVIDER_PROMPT,
  title: "Промпт для добавления VCS провайдера в Timeweb Cloud",
  description: `Объясняет модели, как добавить VCS провайдер для подключения Git репозиториев к Timeweb Cloud.`,
  inputs: {},
  config: {
    title: "Промпт для добавления VCS провайдера в Timeweb Cloud",
    description:
      "Помогает пользователю добавить VCS провайдер для подключения Git репозиториев к Timeweb Cloud",
  },
  handler: () => {
    const prompt = `Добавление VCS провайдера в Timeweb Cloud. Твоя задача - помочь пользователю добавить VCS провайдер для подключения Git репозиториев.
📋 ВХОДНЫЕ ДАННЫЕ:
• URL репозитория (из .git/config или напрямую от пользователя, если не найден в конфиге)
• Тип провайдера

🔐 АВТОРИЗАЦИЯ ДЛЯ ПРИВАТНЫХ РЕПОЗИТОРИЕВ:
• Требуется логин и Personal Access Token
• Токен должен иметь права repo/read/write
• При ошибке авторизации - ПЕРЕЗАПРОС данных у пользователя

⚠️ ОБРАБОТКА ОШИБОК:
• Авторизации (401/403) - запрос новых credentials
• Репозиторий не найден (404) - проверка URL

🚀 РЕЗУЛЬТАТ:
• VCS провайдер готов для создания приложений
• Доступен для tool ${ToolNames.CREATE_TIMEWEB_APP}

Пример работы:
1. Получаю URL репозитория из .git/config
2. Определяю тип провайдера
3. Запрашиваю у пользователя логин и токен/пароль (для приватных репозиториев)
4. Добавляю VCS провайдер через tool ${ToolNames.ADD_VCS_PROVIDER}
5. Провайдер готов к использованию

Начинай работу!`;

    return {
      messages: [
        {
          role: "assistant" as const,
          content: {
            type: "text" as const,
            text: "Ты помощник по работе с облаком Timeweb Cloud. Ты помогаешь пользователю добавить VCS провайдер для подключения Git репозиториев.",
          },
        },
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: prompt,
          },
        },
      ],
    };
  },
};
