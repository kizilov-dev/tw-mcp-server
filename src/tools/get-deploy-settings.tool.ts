import { z } from "zod";
import { ToolNames } from "../types/tool-names.enum";
import { createToolResponse } from "../utils";
import { getDeploySettingsAction } from "../actions/get-deploy-settings.action";

const outputSchema = {
  framework: z.string({
    description: "Название фреймворка",
  }),
  build_cmd: z.string({
    description: "Команда для сборки приложения",
  }),
  index_dir: z.string({
    description: "Директория с index файлом (для frontend приложений)",
  }),
  run_cmd: z
    .string({
      description: "Команда для запуска приложения (для backend приложений)",
    })
    .optional(),
};

const handler = async () => {
  try {
    const deploySettings = await getDeploySettingsAction();

    const responseMessage = `📋 Настройки деплоя по умолчанию:

${deploySettings
  .map(
    (setting) => `🔹 ${setting.framework}:
     build_cmd: ${setting.build_cmd ?? ""}
     index_dir: ${setting.index_dir ?? ""}
     run_cmd: ${setting.run_cmd ?? ""}`
  )
  .join("\n\n")}

💡 Эти настройки нужно использовать при создании приложения в соответствующих полях в зависимости от фреймворка`;

    return createToolResponse(responseMessage);
  } catch (error) {
    if (error instanceof Error) {
      return createToolResponse(
        `❌ Ошибка при получении настроек деплоя. Причина: ${error.message}`
      );
    }

    return createToolResponse(
      `❌ Неизвестная ошибка при получении настроек деплоя.`
    );
  }
};

export const getDeploySettingsTool = {
  name: ToolNames.GET_DEPLOY_SETTINGS,
  title: "Получение настроек деплоя по умолчанию",
  description:
    "Получает список настроек деплоя по умолчанию для различных фреймворков",
  inputSchema: {},
  outputSchema,
  handler,
};
