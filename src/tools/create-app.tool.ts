import { z } from "zod";
import { AppTypes } from "../types/app-types.enum";
import {
  FrameworksBackend,
  FrameworksFrontend,
} from "../types/app-frameworks.type";
import { ToolNames } from "../types/tool-names.enum";
import { createToolResponse } from "../utils";
import { createAppAction } from "../actions/create-app.action";
import { CreateAppParams } from "../types/create-app-params.type";

const inputSchema = {
  type: z.nativeEnum(AppTypes, {
    description: `Тип приложения (frontend/backend). АВТОМАТИЧЕСКИ определить по структуре проекта`,
  }),
  provider_id: z.string({
    description: `ID подключенного VCS провайдера в timeweb cloud. АВТОМАТИЧЕСКИ запросить с помощью tool ${ToolNames.GET_VCS_PROVIDERS} подключенные провайдеры, и выбрать подходящий по названию репозитория. Если нет подходящих, создать новый репозиторий автоматически используя tool ${ToolNames.ADD_VCS_PROVIDER}.`,
  }),
  repository_id: z.string({
    description: `ID репозитория в timeweb cloud. АВТОМАТИЧЕСКИ запросить с помощью tool ${ToolNames.GET_VCS_PROVIDER_REPOSITORIES} подключенные репозитории с использованием provider_id, и выбрать подходящий по названию. Если нет подходящих, НЕ создавать новый репозиторий автоматически`,
  }),
  repository_url: z.string({
    description:
      "URL подключенного репозитория. АВТОМАТИЧЕСКИ достать из папки .git/refs/remotes/origin/, не запуская команды в терминале. URL должен быть в формате https://github.com/user/repo",
  }),
  preset_id: z.number({
    description: `ID пресета приложения в timeweb cloud. АВТОМАТИЧЕСКИ запросить с помощью tool ${ToolNames.GET_ALLOWED_PRESETS} доступные пресеты, и выбрать первый подходящий для определенного типа приложения и фреймворка`,
  }),
  framework: z.union(
    [z.nativeEnum(FrameworksFrontend), z.nativeEnum(FrameworksBackend)],
    {
      description:
        "Фреймворк приложения. АВТОМАТИЧЕСКИ определить по структуре проекта, анализируя package.json, конфигурационные файлы и структуру директорий. Если определить не получается, запросить у пользователя",
    }
  ),
  commit_sha: z
    .string({
      description:
        "SHA коммита активной удаленной ветки. АВТОМАТИЧЕСКИ достать из .git/refs/remotes/origin/HEAD или соответствующей ветки, не запуская команды в терминале. Должен быть полный SHA (40 символов)",
    })
    .min(40, "SHA должен быть полный, не сокращенный"),
  branch_name: z
    .string({
      description:
        "Активная ветка. АВТОМАТИЧЕСКИ достать из .git/HEAD, не запуская команды в терминале. Если ветка не найдена в удаленных, использовать main или master по умолчанию",
    })
    .default("main"),
  name: z
    .string({
      description: "Название приложения (2-3 слова).",
    })
    .min(3, "Название должно содержать минимум 3 символа"),
  build_cmd: z
    .string({
      description:
        "Команда для сборки. АВТОМАТИЧЕСКИ определить по фреймворку. Обязательно для backend приложений",
    })
    .optional(),
  envs: z
    .record(z.string(), {
      description:
        "ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ - ОБЯЗАТЕЛЬНО ЗАПРОСИТЬ У ПОЛЬЗОВАТЕЛЯ! Это критически важная информация, которая влияет на работу приложения. Никогда не придумывай значения - они должны быть предоставлены пользователем явно",
    })
    .optional(),
  comment: z
    .string({
      description: "Комментарий к приложению",
    })
    .default("Приложение создано через MCP сервер"),
  index_dir: z
    .string({
      description: "Директория с index файлом (для frontend)",
    })
    .optional(),
  run_cmd: z
    .string({
      description:
        "Команда для запуска. АВТОМАТИЧЕСКИ определить по фреймворку. Обязательно для backend приложений",
    })
    .optional(),
  system_dependencies: z
    .array(z.string(), {
      description:
        "Системные зависимости. АВТОМАТИЧЕСКИ определить по фреймворку",
    })
    .optional(),
  is_auto_deploy: z
    .literal(false, {
      description: "ВСЕГДА false при создании через MCP сервер",
    })
    .default(false),
};

const outputSchema = {
  id: z.number({
    description: "ID созданного приложения",
  }),
  name: z.string({
    description: "Название приложения",
  }),
  ip: z.string({
    description: "IP адрес приложения",
  }),
  type: z.string({
    description: "Тип приложения (frontend/backend)",
  }),
  domains: z.array(z.string(), {
    description: "Список доменов приложения",
  }),
  framework: z.string({
    description: "Фреймворк приложения",
  }),
  branch: z.string({
    description: "Ветка Git репозитория",
  }),
  comment: z.string({
    description: "Комментарий к приложению",
  }),
  preset_id: z.number({
    description: "ID пресета конфигурации",
  }),
  is_auto_deploy: z.literal(false, {
    description: "Флаг автоматического деплоя (всегда false)",
  }),
  availability_zone: z.string({
    description: "Зона доступности",
  }),
  configuration: z.object(
    {
      cpu: z.number({
        description: "Количество CPU",
      }),
      ram: z.number({
        description: "Объем RAM в МБ",
      }),
      network_bandwidth: z.number({
        description: "Пропускная способность сети",
      }),
      cpu_frequency: z.string({
        description: "Частота процессора",
      }),
      disk_type: z.string({
        description: "Тип диска",
      }),
    },
    {
      description: "Конфигурация ресурсов приложения",
    }
  ),
};

const handler = async (params: CreateAppParams) => {
  try {
    const app = await createAppAction(params);

    if (!app) {
      return createToolResponse(
        `❌ Не удалось создать приложение "${params.name}" в Timeweb Cloud`
      );
    }

    return createToolResponse(`✅ Приложение "${
      app.name
    }" успешно создано в Timeweb Cloud!

📋 Детали приложения:
• Название: ${app.name}
• Тип: ${app.type}
• Фреймворк: ${app.framework}
• Ветка: ${app.branch}
• IP: ${app.ip}
${
  app.domains.length > 0
    ? `• Приложение доступно по адресу: ${app.domains.join(", ")}`
    : ""
}
• Пресет: ${app.preset_id}
${
  app.configuration
    ? `• Конфигурация: ${JSON.stringify(app.configuration)}`
    : ""
}

🎉 Приложение готово к использованию!`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return createToolResponse(
        `❌ Ошибка создания приложения. Причина: ${error.message}`
      );
    }
    return createToolResponse(`❌ Неизвестная ошибка при создании приложения`);
  }
};

export const createAppTool = {
  name: ToolNames.CREATE_TIMEWEB_APP,
  title: "Создание приложения в Timeweb Cloud",
  description: `Создать приложение в Timeweb Cloud с автоматическим определением параметров проекта.

    🔍 АВТОМАТИЧЕСКИ ОПРЕДЕЛЯЕТСЯ:
    • Тип приложения (frontend/backend) по структуре проекта
    • Фреймворк (React, Vue, Angular, Next.js, Django, Express, Laravel и др.)
    • Команды сборки и запуска
    • Системные зависимости
    • VCS провайдер и репозиторий
    • Пресет для развертывания

    📋 ДОСТАЕТСЯ ИЗ ПРОЕКТА:
    • URL репозитория из .git/config
    • SHA коммита из .git/refs
    • Активная ветка из .git/HEAD

    ❓ ТРЕБУЕТ ВВОДА ПОЛЬЗОВАТЕЛЯ:
    • Переменные окружения (envs) - КРИТИЧНО!

    Перед выполнением автоматически выполняются необходимые проверки и сбор данных.`,
  inputSchema,
  outputSchema,
  handler,
};
