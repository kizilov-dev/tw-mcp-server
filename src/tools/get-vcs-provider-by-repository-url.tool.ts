import { createToolResponse } from "../utils";
import { ToolNames } from "../types/tool-names.enum";
import { z } from "zod";
import { appsApiClient } from "../api";
import { withToolErrorHandling } from "../utils/error-handling";
import { ToolDefinition } from "../types/tool.type";

const inputSchema = {
  repository_url: z.string({
    description: "Repository URL to find VCS provider for",
  }),
};

const handler = withToolErrorHandling("finding VCS provider", async (params: { repository_url: string }) => {
  const providers = await appsApiClient.getVcsProviders();

  const provider = providers?.find((provider) =>
    params.repository_url.includes(provider.login.replace(/^[^\/]+\//, ''))
  );

  if (!provider) {
    return createToolResponse(
      `No VCS providers found. Add one via tool ${ToolNames.ADD_VCS_PROVIDER}`
    );
  }

  return createToolResponse(`VCS provider found:

    ${provider.provider} provider
    ID: ${provider.provider_id}
    Name: ${provider.login}`);
});

export const getVcsProviderByRepositoryUrlTool: ToolDefinition = {
  name: ToolNames.GET_VCS_PROVIDER_BY_REPOSITORY_URL,
  title: "Find VCS provider by repository URL",
  description: "Finds VCS provider by repository URL",
  annotations: {
    title: "Find VCS provider by repository URL",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  inputSchema,
  handler,
};
