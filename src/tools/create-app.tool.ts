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
    description:
      "Тип приложения (frontend/backend). Определить по структуре проекта",
  }),
  provider_id: z.string({
    description:
      `ID подключенного VCS провайдера в timeweb cloud. Нужно запросить с помощью tool ${ToolNames.GET_VCS_PROVIDERS} подключенные провайдеры, и выбрать подходящий по названию`,
  }),
  repository_id: z.string({
    description:
      `ID репозитория в timeweb cloud. Нужно запросить с помощью tool ${ToolNames.GET_VCS_PROVIDER_REPOSITORIES} подключенные репозитории с использованием provider_id, и выбрать подходящий по названию. Если нет подходящих, создать новый репозиторий с помощью tool ${ToolNames.ADD_VCS_PROVIDER}`,
  }),
  repository_url: z.string({
    description:
      "Url подключенного репозитория. Нужно достать из папки .git, не запуская команды в терминале. Url должен быть в формате https://github.com/user/repo",
  }),
  preset_id: z.number({
    description:
      `ID пресета приложения в timeweb cloud. Нужно запросить с помощью tool ${ToolNames.GET_ALLOWED_PRESETS} доступные пресеты, и выбрать первый подходящий`,
  }),
  framework: z.union(
    [z.nativeEnum(FrameworksFrontend), z.nativeEnum(FrameworksBackend)],
    {
      description:
        "Фреймворк приложения нужно определить по структуре проекта, и выбрать из доступных",
    }
  ),
  commit_sha: z
    .string({
      description:
        "Получи SHA коммита активной удаленной ветки из .git не используя команды в терминале. Если активная ветка не найдена в удаленных - используй sha веток main или master по умолчанию.",
    })
    .min(40, "SHA должен быть полный, не сокращенный"),
  branch_name: z
    .string({
      description:
        "Активная ветка из папки .git. Если в удаленных ее нет, взять по умолчанию main или master. Не запуская команды в терминале",
    })
    .default("main"),
  name: z
    .string({
      description: "Название приложения (2-3 слова)",
    })
    .min(3, "Название должно содержать минимум 3 символа"),
  build_cmd: z
    .string({
      description:
        "Команда для сборки. Обязательное поле для backend приложений. Указать в зависимости от типа приложения и фреймворка",
    })
    .optional(),
  envs: z
    .record(z.string(), {
      description: "Переменные окружения.",
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
      description: "Команда для запуска (для backend)",
    })
    .optional(),
  system_dependencies: z
    .array(z.string(), {
      description: "Системные зависимости",
    })
    .optional(),
  is_auto_deploy: z.literal(false).default(false),
};

const handler = async (params: CreateAppParams) => {
  try {
    const app = await createAppAction(params);

    if (!app) {
      return createToolResponse(
        `❌ Не удалось создать приложение "${params.name}" в Timeweb Cloud`
      );
    }

    return createToolResponse(`✅ Приложение "${app.name}" успешно создано в Timeweb Cloud!

📋 Детали приложения:
• Название: ${app.name}
• Тип: ${app.type}
• Фреймворк: ${app.framework}
• Ветка: ${app.branch}
• IP: ${app.ip}
${app.domains.length > 0 ? `• Приложение доступно по адресу: ${app.domains.join(", ")}` : ""}
• Пресет: ${app.preset_id}
${app.configuration ? `• Конфигурация: ${JSON.stringify(app.configuration)}` : ""}

🎉 Приложение готово к использованию!`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return createToolResponse(
        `❌ Ошибка создания приложения. Причина: ${error.message}`
      );
    }
    return createToolResponse(
      `❌ Неизвестная ошибка при создании приложения`
    );
  }
};

export const createAppTool = {
  name: ToolNames.CREATE_TIMEWEB_APP,
  title: "Создание приложения в Timeweb Cloud",
  description:
    `Создать приложение в Timeweb Cloud. Перед выполнением инструмента нужно выполнить инструменты ${ToolNames.GET_VCS_PROVIDERS} и ${ToolNames.GET_VCS_PROVIDER_REPOSITORIES}. Если нет подключенных vcs провайдеров, добавить новый с помощью tool ${ToolNames.ADD_VCS_PROVIDER}. Найти подходящий provider_id. Получить доступные пресеты с помощью tool ${ToolNames.GET_ALLOWED_PRESETS} и выбрать первый подходящий`,
  inputSchema,
  handler,
};
