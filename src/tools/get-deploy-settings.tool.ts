import { ToolNames } from "../types/tool-names.enum";
import { createToolResponse } from "../utils";
import { appsApiClient } from "../api";
import { withToolErrorHandling } from "../utils/error-handling";
import { ToolDefinition } from "../types/tool.type";

const handler = withToolErrorHandling("fetching deploy settings", async () => {
  const deploySettings = await appsApiClient.getDeploySettings();

  const responseMessage = `Default deploy settings:

${deploySettings
  .map(
    (setting) => `${setting.framework}:
  build_cmd: ${setting.build_cmd ?? ""}
  index_dir: ${setting.index_dir ?? ""}
  run_cmd: ${setting.run_cmd ?? ""}`
  )
  .join("\n\n")}

Use these settings in corresponding fields when creating an app, based on framework.`;

  return createToolResponse(responseMessage);
});

export const getDeploySettingsTool: ToolDefinition = {
  name: ToolNames.GET_DEPLOY_SETTINGS,
  title: "Get default deploy settings",
  description:
    "Gets default deploy settings for various frameworks",
  annotations: {
    title: "Get default deploy settings",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  inputSchema: {},
  handler,
};
