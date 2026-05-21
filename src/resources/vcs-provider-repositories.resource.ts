import { appsApiClient } from "../api";
import { ResourceNames } from "../types/resource-names.enum";
import { createResourceResponse } from "../utils";
import { withResourceErrorHandling } from "../utils/error-handling";

export const vcsProviderRepositoriesResource = {
  name: ResourceNames.VCS_PROVIDER_REPOSITORIES,
  uri: "vcs-provider://{provider_id}/repositories",
  title: "Provider repositories",
  description: "Repositories for a VCS provider in Timeweb Cloud",
  handler: withResourceErrorHandling("repositories", async (uri: URL, variables: Record<string, string>) => {
    const providerId = variables?.provider_id;

    if (!providerId) {
      return createResourceResponse(uri.href, "Error: provider_id not specified");
    }

    const result = await appsApiClient.getVcsProviderRepositories(providerId);

    if (!result || result.length === 0) {
      return createResourceResponse(
        uri.href,
        `No repositories found for provider ${providerId}`
      );
    }

    return createResourceResponse(uri.href, JSON.stringify(result, null, 2));
  }),
};
