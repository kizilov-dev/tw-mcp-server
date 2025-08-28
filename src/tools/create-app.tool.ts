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
      "ID подключенного VCS провайдера в timeweb cloud. Нужно запросить подключенные, и выбрать подходящий по названию",
  }),
  repository_id: z.string({
    description:
      "ID репозитория в timeweb cloud. Нужно запросить подключенные, и выбрать подходящий по названию",
  }),
  repository_url: z.string({
    description:
      "Url подключенного репозитория. Нужно достать из папки .git, не запуская команды в терминале",
  }),
  preset_id: z.number({
    description:
      "ID пресета приложения в timeweb cloud. Нужно запросить доступные, и выбрать первый подходящий",
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
      description: "Команда для сборки",
    })
    .optional(),
  envs: z
    .record(z.string(), {
      description: "Переменные окружения. ",
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
};

// Обработчик создания приложения
const handler = async (params: CreateAppParams) => {
  try {
    await createAppAction(params);

    return createToolResponse(`✅ Приложение "${
      params.name
    }" успешно создано в Timeweb Cloud!

📋 Детали приложения:
• Название: ${params.name}
• Тип: ${params.type}
• Фреймворк: ${params.framework}
• Ветка: ${params.branch_name}
• Автодеплой: ${params.is_auto_deploy ? "✅ Включен" : "❌ Отключен"}

🎉 Приложение готово к использованию!`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors
        .map((e) => `• ${e.path.join(".")}: ${e.message}`)
        .join("\n");

      throw new Error(`❌ Ошибка валидации данных:\n${validationErrors}`);
    }

    if (error instanceof Error) {
      throw new Error(`❌ Ошибка при создании приложения: ${error.message}`);
    }

    throw new Error(`❌ Неизвестная ошибка: ${String(error)}`);
  }
};

export const createAppTool = {
  name: ToolNames.CREATE_TIMEWEB_APP,
  title: "Создание приложения в Timeweb Cloud",
  description:
    "Создать приложение в Timeweb Cloud. Перед выполнением инструмента нужно выполнить инструменты get_vcs_providers и get_vcs_provider_repositories. Если нет подключенных vcs провайдеров, добавить новый с помощью tool 'add_vcs_provider'. Если нет подходящих пресетов, получить доступные пресеты и выбрать первый подходящий с помощью tool 'get_presets'.",
  inputSchema,
  handler,
};
