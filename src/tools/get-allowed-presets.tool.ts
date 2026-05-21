import { ToolNames } from "../types/tool-names.enum";
import { createToolResponse } from "../utils";
import { appsApiClient } from "../api";
import { withToolErrorHandling } from "../utils/error-handling";
import { ToolDefinition } from "../types/tool.type";

const handler = withToolErrorHandling("fetching presets", async () => {
  const presets = await appsApiClient.getAllowedPresets();

  const responseMessage = `App presets:

Backend presets:
${
  presets.backend_presets
    ?.map(
      (preset) =>
        `ID: ${preset.id} | ${preset.description_short}
  Price: ${preset.price} RUB/mo
  CPU: ${preset.cpu}, RAM: ${preset.ram / 1024}GB, Disk: ${preset.disk / 1024}GB
  Frequency: ${preset.cpu_frequency}GHz`
    )
    .join("\n\n") || "  No backend presets available"
}

Frontend presets:
${
  presets.frontend_presets
    ?.map(
      (preset) =>
        `ID: ${preset.id} | ${preset.description_short}
  Price: ${preset.price} RUB/mo
  Disk: ${preset.disk}MB`
    )
    .join("\n\n") || "  No frontend presets available"
}

Use preset ID in the preset_id field when creating an app.`;

  return createToolResponse(responseMessage);
});

export const getAllowedPresetsTool: ToolDefinition = {
  name: ToolNames.GET_ALLOWED_PRESETS,
  title: "Get allowed app presets",
  description: "Gets list of available presets for app creation",
  annotations: {
    title: "Get allowed app presets",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  inputSchema: {},
  handler,
};
