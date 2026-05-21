import { appsApiClient } from "../api";
import { ResourceNames } from "../types/resource-names.enum";
import { createResourceResponse } from "../utils";
import { withResourceErrorHandling } from "../utils/error-handling";

export const deploySettingsResource = {
  name: ResourceNames.DEPLOY_SETTINGS,
  uri: "deploy-settings://all",
  title: "Default deploy settings",
  description: "Default deploy settings for frameworks in Timeweb Cloud",
  handler: withResourceErrorHandling("deploy settings", async (uri: URL) => {
    const result = await appsApiClient.getDeploySettings();

    if (!result) {
      return createResourceResponse(uri.href, "No deploy settings available");
    }

    return createResourceResponse(uri.href, JSON.stringify(result, null, 2));
  }),
};
