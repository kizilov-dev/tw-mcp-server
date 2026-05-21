import { appsApiClient } from "../api";
import { ResourceNames } from "../types/resource-names.enum";
import { createResourceResponse } from "../utils";
import { withResourceErrorHandling } from "../utils/error-handling";

export const vcsProvidersResource = {
  name: ResourceNames.VCS_PROVIDERS,
  uri: "vcs-provider://all",
  title: "VCS providers",
  description: "Connected VCS providers in Timeweb Cloud",
  handler: withResourceErrorHandling("VCS providers", async (uri: URL) => {
    const result = await appsApiClient.getVcsProviders();

    if (!result || result.length === 0) {
      return createResourceResponse(uri.href, "No VCS providers found");
    }

    return createResourceResponse(uri.href, JSON.stringify(result, null, 2));
  }),
};
