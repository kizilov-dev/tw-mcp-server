import { z } from "zod";
import { createToolResponse } from "../utils";
import { AddVcsProviderRequestDto } from "../types/dto/add-vcs-provider-request.dto";
import { appsApiClient } from "../api";
import { ToolNames } from "../types/tool-names.enum";
import { VcsProviders } from "../types/vcs-providers.enum";
import { ToolDefinition } from "../types/tool.type";

const inputSchema = {
  url: z
    .string({
      description: `Repository URL in HTTPS format. Example: https://github.com/username/repo.git. AUTO-DETECT from .git/config if not specified.`,
    })
    .url("Must be a valid URL"),
  login: z
    .string({
      description: `Repository access login. Required for private repositories.
        If auth error occurs when adding provider:
        - Ask user for login and token
        - Retry with new credentials`,
    })
    .optional(),
  password: z
    .string({
      description: `Repository access password or token. Required for private repositories.
        Options:
        - Personal Access Token (recommended)
        - Account password

        If auth error occurs when adding provider:
        - Ask user for token/password
        - Retry with new credentials`,
    })
    .optional(),
  provider_type: z.nativeEnum(VcsProviders, {
    description: "VCS provider type",
  }),
};

const handler = async (params: AddVcsProviderRequestDto) => {
  try {

    if (!params.provider_type) {
      return createToolResponse(
        `❌ VCS provider type not specified`
      );
    }

    if (params.provider_type === VcsProviders.GIT) {
      await appsApiClient.addVcsProvider(params);
    } else {
      return createToolResponse(
        `❌ Unsupported VCS provider type: use git for URL-based connection`
      );
    }


    return createToolResponse(`✅ VCS provider added

Type: ${params.provider_type}
URL: ${params.url}
${params.login ? `Login: ${params.login}` : ""}
${params.password ? `Password/token: ***` : ""}`);
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      if (
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("403") ||
        errorMessage.includes("401")
      ) {
        return createToolResponse(
          `❌ AUTH ERROR: Invalid credentials. Ask user for login + token and retry.

Details: ${error.message}`
        );
      }

      if (
        errorMessage.includes("repository not found") ||
        errorMessage.includes("404") ||
        errorMessage.includes("not found")
      ) {
        return createToolResponse(
          `❌ REPOSITORY NOT FOUND: Verify URL exists and is accessible.

URL: ${params.url}`
        );
      }

      return createToolResponse(
        `❌ Error adding VCS provider: ${error.message}`
      );
    }

    return createToolResponse(
      `❌ Unknown error adding VCS provider`
    );
  }
};

export const addVcsProviderTool: ToolDefinition = {
  name: ToolNames.ADD_VCS_PROVIDER,
  title: "Add VCS provider",
  description: `Adds a new VCS provider for connecting Git repositories to Timeweb Cloud`,
  annotations: {
    title: "Add VCS provider",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  inputSchema,
  handler,
};
