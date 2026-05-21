import { appsApiClient } from "../api";
import { ResourceNames } from "../types/resource-names.enum";
import { createResourceResponse } from "../utils";
import { withResourceErrorHandling } from "../utils/error-handling";

export const allowedPresetsResource = {
  name: ResourceNames.ALLOWED_PRESETS,
  uri: "allowed-presets://all",
  title: "Allowed app presets",
  description: "Available presets for creating apps in Timeweb Cloud",
  handler: withResourceErrorHandling("app presets", async (uri: URL) => {
    const result = await appsApiClient.getAllowedPresets();

    if (!result) {
      return createResourceResponse(uri.href, "No presets available");
    }

    return createResourceResponse(uri.href, JSON.stringify(result, null, 2));
  }),
};
