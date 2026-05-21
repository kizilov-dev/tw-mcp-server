import { createToolResponse } from "../utils";
import { appsApiClient } from "../api";
import { ToolNames } from "../types/tool-names.enum";
import { withToolErrorHandling } from "../utils/error-handling";
import { ToolDefinition } from "../types/tool.type";

const handler = withToolErrorHandling("fetching VCS providers", async () => {
  const providers = await appsApiClient.getVcsProviders();

  if (!providers || providers.length === 0) {
    return createToolResponse(
      `No VCS providers found. Add one via tool ${ToolNames.ADD_VCS_PROVIDER}`
    );
  }

  const providersList = providers
    .map(
      (provider) =>
        `${provider.provider} provider
        ID: ${provider.provider_id}
        Name: ${provider.login}`
    )
    .join("\n\n");

  return createToolResponse(`VCS providers:

    ${providersList}

    Total: ${providers.length}`);
});

export const getVcsProvidersTool: ToolDefinition = {
  name: ToolNames.GET_VCS_PROVIDERS,
  title: "Get VCS providers",
  description: "Gets list of all added VCS providers",
  annotations: {
    title: "Get VCS providers",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  inputSchema: {},
  handler,
};
