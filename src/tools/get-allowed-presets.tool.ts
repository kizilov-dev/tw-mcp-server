import { z } from "zod";
import { ToolNames } from "../types/tool-names.enum";
import { createToolResponse } from "../utils";
import { getAllowedPresetsAction } from "../actions/get-allowed-presets.action";

const outputSchema = {
  backend_presets: z.array(
    z.object({
      id: z.number({
        description: "ID пресета для backend приложений",
      }),
      description: z.string({
        description: "Полное описание пресета",
      }),
      description_short: z.string({
        description: "Краткое описание пресета",
      }),
      price: z.number({
        description: "Цена пресета в рублях/месяц",
      }),
      cpu: z.number({
        description: "Количество CPU ядер",
      }),
      ram: z.number({
        description: "Объем RAM в МБ",
      }),
      disk: z.number({
        description: "Размер диска в МБ",
      }),
      location: z.string({
        description: "Локация сервера",
      }),
      cpu_frequency: z.string({
        description: "Частота процессора",
      }),
    }),
    {
      description: "Список доступных пресетов для backend приложений",
    }
  ),
  frontend_presets: z.array(
    z.object({
      id: z.number({
        description: "ID пресета для frontend приложений",
      }),
      description: z.string({
        description: "Полное описание пресета",
      }),
      description_short: z.string({
        description: "Краткое описание пресета",
      }),
      price: z.number({
        description: "Цена пресета в рублях/месяц",
      }),
      location: z.string({
        description: "Локация сервера",
      }),
      requests: z.number({
        description: "Количество запросов в месяц",
      }),
      disk: z.number({
        description: "Размер диска в МБ",
      }),
    }),
    {
      description: "Список доступных пресетов для frontend приложений",
    }
  ),
};

const handler = async () => {
  try {
    const presets = await getAllowedPresetsAction();

    const responseMessage = `📋 Доступные пресеты для создания приложения:

🔹 Backend пресеты:
${
  presets.backend_presets
    ?.map(
      (preset) =>
        `ID: ${preset.id} | ${preset.description_short}
     💰 Цена: ${preset.price}₽/мес
     🖥️ CPU: ${preset.cpu}
     💾 RAM: ${preset.ram / 1024}Gb
     💿 Диск: ${preset.disk / 1024}Gb
     ⚡ Частота: ${preset.cpu_frequency}GHz`
    )
    .join("\n\n") || "  Нет доступных backend пресетов"
}

🔹 Frontend пресеты:
${
  presets.frontend_presets
    ?.map(
      (preset) =>
        `ID: ${preset.id} | ${preset.description_short}
     💰 Цена: ${preset.price}₽/мес
     💿 Диск: ${preset.disk}Mb`
    )
    .join("\n\n") || "  Нет доступных frontend пресетов"
}

💡 Используйте ID пресета при создании приложения в поле preset_id`;

    return createToolResponse(responseMessage);
  } catch (error) {
    if (error instanceof Error) {
      return createToolResponse(
        `❌ Ошибка при получении пресетов. Причина: ${error.message}`
      );
    }

    return createToolResponse(`❌ Неизвестная ошибка при получении пресетов.`);
  }
};

export const getAllowedPresetsTool = {
  name: ToolNames.GET_ALLOWED_PRESETS,
  title: "Получение доступных пресетов для создания приложения",
  description: "Получает список доступных пресетов для создания приложения",
  inputSchema: {},
  outputSchema,
  handler,
};
