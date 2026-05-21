import { createToolResponse } from "../utils";
import { databaseApiClient } from "../api";
import { ToolNames } from "../types/tool-names.enum";
import { withToolErrorHandling } from "../utils/error-handling";
import { ToolDefinition } from "../types/tool.type";

const handler = withToolErrorHandling("fetching database presets", async () => {
  const presets = await databaseApiClient.getPresets();

  if (!presets || !presets.length) {
    return createToolResponse(
      `❌ Failed to fetch database presets`
    );
  }

  const response = `Database presets:\n\n${JSON.stringify(presets, null, 2)}`;

  return createToolResponse(response);
});

export const getDatabasePresetsTool: ToolDefinition = {
  name: ToolNames.GET_DATABASE_PRESETS,
  title: "Get database presets",
  description:
    "Gets list of available configuration presets for database creation",
  annotations: {
    title: "Get database presets",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  inputSchema: {},
  handler,
};
