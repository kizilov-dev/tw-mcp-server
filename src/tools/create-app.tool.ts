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
import { getVcsProvidersAction } from "../actions/get-vcs-providers.action";

const frameworks = [
  ...Object.values(FrameworksFrontend),
  ...Object.values(FrameworksBackend),
];

const inputSchema = {
  type: z
    .nativeEnum(AppTypes, {
      description: `Тип приложения (frontend/backend). АВТОМАТИЧЕСКИ определить по структуре проекта`,
    })
    .describe(
      "ОБЯЗАТЕЛЬНОЕ ПОЛЕ - тип приложения должен быть определен (frontend или backend)"
    ),

  provider_id: z
    .string({
      description: `ID подключенного VCS провайдера в timeweb cloud. АВТОМАТИЧЕСКИ запросить с помощью tool ${ToolNames.GET_VCS_PROVIDERS} подключенные провайдеры, и выбрать подходящий по названию репозитория. Если нет подходящих, создать новый репозиторий автоматически используя tool ${ToolNames.ADD_VCS_PROVIDER}.`,
    })
    .describe("ОБЯЗАТЕЛЬНОЕ ПОЛЕ - ID VCS провайдера"),

  repository_id: z
    .string({
      description: `ID репозитория в timeweb cloud. АВТОМАТИЧЕСКИ запросить с помощью tool ${ToolNames.GET_VCS_PROVIDER_REPOSITORIES} подключенные репозитории с использованием provider_id, и выбрать подходящий по названию. Если нет подходящих, НЕ создавать новый репозиторий автоматически`,
    })
    .describe("ОБЯЗАТЕЛЬНОЕ ПОЛЕ - ID репозитория"),

  repository_url: z
    .string({
      description:
        "URL подключенного репозитория. АВТОМАТИЧЕСКИ достать из папки .git/refs/remotes/origin/, не запуская команды в терминале. URL должен быть в формате https://github.com/user/repo",
    })
    .url("URL должен быть валидным")
    .describe("ОБЯЗАТЕЛЬНОЕ ПОЛЕ - URL репозитория"),

  preset_id: z
    .number({
      description: `ID пресета приложения в timeweb cloud. АВТОМАТИЧЕСКИ запросить с помощью tool ${ToolNames.GET_ALLOWED_PRESETS} доступные пресеты, и выбрать первый подходящий для определенного типа приложения и фреймворка`,
    })
    .int("ID пресета должен быть целым числом")
    .positive("ID пресета должен быть положительным числом")
    .describe("ОБЯЗАТЕЛЬНОЕ ПОЛЕ - ID пресета"),

  framework: z
    .union(
      [z.nativeEnum(FrameworksFrontend), z.nativeEnum(FrameworksBackend)],
      {
        description:
          "Фреймворк приложения. АВТОМАТИЧЕСКИ определить по структуре проекта, анализируя package.json, конфигурационные файлы и структуру директорий. Если в структуре проекта есть файлы Dockerfile или docker-compose, то это backend приложение с типом docker или docker-compose. Если определить не получается, запросить у пользователя",
      }
    )
    .describe(
      "ОБЯЗАТЕЛЬНОЕ ПОЛЕ - фреймворк приложения (React, Vue, Angular, Next.js, Django, Express, Laravel, Docker и др.). Если в структуре проекта есть файлы Dockerfile или docker-compose, то это backend приложение с типом docker или docker-compose."
    )
    .refine((framework) => frameworks.includes(framework), {
      message:
        "Фреймворк должен быть одним из следующих: " + frameworks.join(", "),
    }),

  commit_sha: z
    .string({
      description:
        "SHA коммита активной удаленной ветки. АВТОМАТИЧЕСКИ достать из .git/refs/remotes/origin/HEAD или соответствующей ветки, НЕ запуская команды в терминале. Должен быть полный SHA (40 символов)",
    })
    .min(40, "SHA должен быть полный, не сокращенный")
    .max(40, "SHA должен быть ровно 40 символов")
    .regex(
      /^[a-f0-9]{40}$/i,
      "SHA должен содержать только шестнадцатеричные символы (a-f, 0-9)"
    )
    .refine((sha) => sha.trim().length === 40, {
      message: "SHA коммита должен быть ровно 40 символов (не считая пробелы)",
    })
    .describe("ОБЯЗАТЕЛЬНОЕ ПОЛЕ - SHA коммита (40 символов)"),

  branch_name: z
    .string({
      description:
        "Активная ветка. АВТОМАТИЧЕСКИ достать из .git/HEAD, не запуская команды в терминале.",
    })
    .refine((branch) => branch.trim().length > 0, {
      message: "Некорректное название ветки",
    })
    .describe("ОБЯЗАТЕЛЬНОЕ ПОЛЕ - название ветки"),

  name: z
    .string({
      description: "Название приложения (2-3 слова).",
    })
    .min(3, "Название должно содержать минимум 3 символа")
    .max(80, "Название слишком длинное (максимум 80 символов)")
    .regex(
      /^[a-zA-Zа-яА-Я0-9\s\-_]+$/,
      "Название может содержать только буквы, цифры, пробелы, дефисы и подчеркивания"
    )
    .describe("ОБЯЗАТЕЛЬНОЕ ПОЛЕ - название приложения"),

  build_cmd: z
    .string({
      description: `Команда для сборки. АВТОМАТИЧЕСКИ определить в зависимости от фреймворка и структуры проекта. МОЖНО использовать tool ${ToolNames.GET_DEPLOY_SETTINGS} для получения настроек по умолчанию для конкретного фреймворка. ОБЯЗАТЕЛЬНО для всех приложений`,
    })
    .describe("ОБЯЗАТЕЛЬНОЕ ПОЛЕ - команда сборки"),

  envs: z
    .record(z.string(), {
      description:
        "Это критически важная информация, которая влияет на работу приложения. Пользователь должен предоставить все переменные окружения.",
    })
    .describe(
      "ОБЯЗАТЕЛЬНОЕ ПОЛЕ - переменные окружения. Пользователь должен указать их самостоятельно"
    )
    .default({}),

  comment: z
    .string({
      description: "Комментарий к приложению",
    })
    .min(1, "Комментарий не может быть пустым")
    .max(200, "Комментарий слишком длинный")
    .refine((comment) => comment.trim().length > 0, {
      message: "Комментарий не может состоять только из пробелов",
    })
    .default("Приложение создано через MCP сервер")
    .describe("НЕ ОБЯЗАТЕЛЬНОЕ ПОЛЕ - комментарий"),

  index_dir: z
    .string({
      description: `Директория с index файлом (ТОЛЬКО для frontend приложений). Использовать tool ${ToolNames.GET_DEPLOY_SETTINGS} для получения настроек по умолчанию для конкретного фреймворка.`,
    })
    .describe(
      "ОБЯЗАТЕЛЬНОЕ ПОЛЕ ТОЛЬКО для frontend приложений - директория с index файлом"
    ),

  run_cmd: z
    .string({
      description: `Команда для запуска. Использовать tool ${ToolNames.GET_DEPLOY_SETTINGS} для получения настроек по умолчанию для конкретного фреймворка. ОБЯЗАТЕЛЬНО для backend приложений`,
    })
    .describe("ОБЯЗАТЕЛЬНОЕ ПОЛЕ для backend приложений - команда запуска"),

  system_dependencies: z
    .array(z.string(), {
      description:
        "Системные зависимости. АВТОМАТИЧЕСКИ определить по фреймворку и структуре проекта, если нужно.",
    })
    .describe("НЕ ОБЯЗАТЕЛЬНОЕ ПОЛЕ - системные зависимости (если нужно)")
    .default([]),

  is_auto_deploy: z
    .literal(false, {
      description: "ВСЕГДА false при создании через MCP сервер",
    })
    .default(false)
    .describe("ОБЯЗАТЕЛЬНОЕ ПОЛЕ - всегда false"),
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
    const providers = await getVcsProvidersAction();
    const repositoryName = params.repository_url.split("/").pop()?.replace(".git", "");
    const provider = providers?.find(
      (provider) => repositoryName && provider.login.includes( repositoryName)
    );
    if (!provider) {
      return createToolResponse(
        `❌ Не удалось найти VCS провайдер для репозитория "${params.repository_url}". Нужно добавить VCS провайдер с помощью tool ${ToolNames.ADD_VCS_PROVIDER}`
      );
    }

    
    const app = await createAppAction({...params, provider_id: provider.provider_id});

    if (!app) {
      return createToolResponse(
        `❌ Не удалось создать приложение "${params.name}" в Timeweb Cloud`
      );
    }

    return createToolResponse(`✅ Приложение "${app.name}" успешно создано в Timeweb Cloud!

📋 Детали созданного приложения:
• Название: ${app.name}
• Тип: ${app.type}
• Фреймворк: ${app.framework}
• Ветка: ${app.branch}
• IP: ${app.ip}
${
  app.domains.length > 0
    ? `• Приложение будет доступно по адресу: ${app.domains[0].fqdn}`
    : ""
}
• Пресет: ${app.preset_id}
${
  app.configuration
    ? `• Конфигурация: ${JSON.stringify(app.configuration)}`
    : ""
}

🎉 Приложение скоро будет готово к использованию!`);
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
  description: `Создает приложение в Timeweb Cloud с автоматическим определением параметров проекта.`,
  inputSchema,
  outputSchema,
  handler,
};
