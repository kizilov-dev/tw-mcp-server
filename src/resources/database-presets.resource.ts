import { databaseApiClient } from "../api";
import { ResourceNames } from "../types/resource-names.enum";
import { createResourceResponse } from "../utils";
import { withResourceErrorHandling } from "../utils/error-handling";

export const databasePresetsResource = {
  name: ResourceNames.DATABASE_PRESETS,
  uri: "database-presets://all",
  title: "Database presets",
  description: "Available database configuration presets in Timeweb Cloud",
  handler: withResourceErrorHandling("database presets", async (uri: URL) => {
    const presets = await databaseApiClient.getPresets();

    if (!presets || !presets.length) {
      return createResourceResponse(uri.href, "No database presets available");
    }

    return createResourceResponse(uri.href, JSON.stringify(presets, null, 2));
  }),
};
