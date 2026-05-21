import { z } from "zod";
import { createToolResponse } from "../utils";
import { ToolNames } from "../types/tool-names.enum";
import { appsApiClient } from "../api";
import { withToolErrorHandling } from "../utils/error-handling";
import { ToolDefinition } from "../types/tool.type";

const inputSchema = {
  provider_id: z.string({
    description: "Provider ID to get repository list for",
  }),
};

const handler = withToolErrorHandling("fetching repositories", async (params: { provider_id: string }) => {
  const repositories = await appsApiClient.getVcsProviderRepositories(
    params.provider_id
  );

  if (!repositories || repositories.length === 0) {
    return createToolResponse(
      `No repositories found. Verify provider ID: ${params.provider_id}`
    );
  }

  const repositoriesList = repositories
    .map((repo) => `${repo.url} (ID: ${repo.id})`)
    .join("\n\n");

  return createToolResponse(`Repositories for provider ${params.provider_id}:

${repositoriesList}

Total: ${repositories.length}`);
});

export const getVcsProviderRepositoriesTool: ToolDefinition = {
  name: ToolNames.GET_VCS_PROVIDER_REPOSITORIES,
  title: "Get VCS provider repositories",
  description: "Gets repository list for a VCS provider by ID",
  annotations: {
    title: "Get VCS provider repositories",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  inputSchema,
  handler,
};
