import { z } from "zod";
import { appsApiClient } from "../api";
import { ToolNames } from "../types/tool-names.enum";
import { createToolResponse } from "../utils";

const inputSchema = {};

const handler = async () => {
  try {
    console.log("📋 Получение списка доступных пресетов...");

    const presets = await appsApiClient.getAllowedPresets();

    const responseMessage = `📋 Доступные пресеты для создания приложения:

🔹 Backend пресеты:
${
  presets.backend_presets
    ?.map(
      (preset) =>
        `ID: ${preset.id} | ${preset.description_short}
     💰 Цена: ${preset.price}₽/мес
     🖥️ CPU: ${preset.cpu}
     💾 RAM: ${preset.ram}GB
     💿 Диск: ${preset.disk}GB
     ⚡ Частота: ${preset.cpu_frequency}`
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
     💿 Диск: ${preset.disk}GB`
    )
    .join("\n\n") || "  Нет доступных frontend пресетов"
}

💡 Используйте ID пресета при создании приложения в поле preset_id`;

    return createToolResponse(responseMessage);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors
        .map((e) => `• ${e.path.join(".")}: ${e.message}`)
        .join("\n");

      throw new Error(`❌ Ошибка валидации данных:\n${validationErrors}`);
    }

    if (error instanceof Error) {
      throw new Error(`❌ Ошибка при получении пресетов: ${error.message}`);
    }

    throw new Error(`❌ Неизвестная ошибка: ${String(error)}`);
  }
};

export const getAllowedPresetsTool = {
  name: ToolNames.GET_ALLOWED_PRESETS,
  title: "Получение доступных пресетов для создания приложения",
  description: "Получает список доступных пресетов для создания приложения",
  inputSchema,
  handler,
};
