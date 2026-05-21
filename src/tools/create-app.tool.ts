import { z } from "zod";
import { AppTypes } from "../types/app-types.enum";
import {
  FrameworksBackend,
  FrameworksFrontend,
} from "../types/app-frameworks.type";
import { ToolNames } from "../types/tool-names.enum";
import { createToolResponse } from "../utils";
import { appsApiClient } from "../api";
import { CreateAppParams } from "../types/create-app-params.type";
import { ResourceNames } from "../types/resource-names.enum";
import { ToolDefinition } from "../types/tool.type";

const frameworks = [
  ...Object.values(FrameworksFrontend),
  ...Object.values(FrameworksBackend),
];

const inputSchema = {
  type: z
    .nativeEnum(AppTypes, {
      description: `App type (frontend/backend). AUTO-DETECT from project structure`,
    })
    .describe(
      "REQUIRED - app type (frontend or backend)"
    ),

  provider_id: z
    .string({
      description: `VCS provider ID. AUTO-FETCH via tool ${ToolNames.GET_VCS_PROVIDER_BY_REPOSITORY_URL}, pick matching one. If none found, create via ${ToolNames.ADD_VCS_PROVIDER}.`,
    })
    .uuid("Must be a valid UUID")
    .describe("REQUIRED - VCS provider ID"),

  repository_id: z
    .string({
      description: `Repository ID. AUTO-FETCH via tool ${ToolNames.GET_VCS_PROVIDER_REPOSITORIES} using provider_id, pick matching one. Do NOT create automatically if not found.`,
    })
    .uuid("Must be a valid UUID")
    .describe("REQUIRED - repository ID"),

  repository_url: z
    .string({
      description:
        "Repository URL. AUTO-READ from .git/config, do NOT run shell commands. Must be https format.",
    })
    .url("Must be a valid URL")
    .describe("REQUIRED - repository URL"),

  preset_id: z
    .number({
      description: `App preset ID. AUTO-FETCH via resource ${ResourceNames.ALLOWED_PRESETS}, pick first matching preset for the app type.`,
    })
    .int("Preset ID must be an integer")
    .positive("Preset ID must be positive")
    .describe("REQUIRED - preset ID"),

  framework: z
    .union(
      [z.nativeEnum(FrameworksFrontend), z.nativeEnum(FrameworksBackend)],
      {
        description:
          "Framework. AUTO-DETECT from project structure (package.json, config files, directories). Dockerfile/docker-compose = backend docker. Ask user if unclear.",
      }
    )
    .describe(
      "REQUIRED - app framework (React, Vue, Angular, Next.js, Django, Express, Laravel, Docker, etc.). Dockerfile/docker-compose = backend docker/docker-compose."
    )
    .refine((framework) => frameworks.includes(framework), {
      message:
        "Framework must be one of: " + frameworks.join(", "),
    }),

  commit_sha: z
    .string({
      description:
        "Commit SHA of active remote branch. AUTO-READ from .git/refs/remotes/origin/<branch>, do NOT run shell commands. Must be full 40-char SHA.",
    })
    .min(40, "SHA must be full, not abbreviated")
    .max(40, "SHA must be exactly 40 characters")
    .regex(
      /^[a-f0-9]{40}$/i,
      "SHA must contain only hex characters (a-f, 0-9)"
    )
    .refine((sha) => sha.trim().length === 40, {
      message: "SHA must be exactly 40 characters (excluding whitespace)",
    })
    .describe("REQUIRED - commit SHA (40 characters)"),

  branch_name: z
    .string({
      description:
        "Active branch. AUTO-READ from .git/HEAD, do NOT run shell commands.",
    })
    .refine((branch) => branch.trim().length > 0, {
      message: "Invalid branch name",
    })
    .describe("REQUIRED - branch name"),

  name: z
    .string({
      description: "App name (2-3 words).",
    })
    .min(3, "Name must be at least 3 characters")
    .max(80, "Name too long (max 80 characters)")
    .regex(
      /^[a-zA-Zа-яА-Я0-9\s\-_]+$/,
      "Name may only contain letters, digits, spaces, hyphens, and underscores"
    )
    .describe("REQUIRED - app name"),

  build_cmd: z
    .string({
      description: `Build command. AUTO-DETECT from framework. Use resource ${ResourceNames.DEPLOY_SETTINGS} for defaults.`,
    })
    .describe("REQUIRED - build command"),

  envs: z
    .record(z.string(), {
      description:
        "Environment variables. User must provide these -- critical for app operation.",
    })
    .describe(
      "REQUIRED - environment variables. User must provide them."
    )
    .default({}),

  comment: z
    .string({
      description: "Optional comment",
    })
    .max(200, "Comment too long")
    .refine((comment) => comment.trim().length > 0, {
      message: "Comment cannot be only whitespace",
    })
    .default("Created via MCP server")
    .describe("OPTIONAL - comment"),

  index_dir: z
    .string({
      description: `Index directory (frontend only). Use resource ${ResourceNames.DEPLOY_SETTINGS} for defaults.`,
    })
    .describe("Frontend only - index directory")
    .optional(),

  run_cmd: z
    .string({
      description: `Run command. Use resource ${ResourceNames.DEPLOY_SETTINGS} for defaults. Required for backend.`,
    })
    .describe("REQUIRED for backend - run command"),

  system_dependencies: z
    .array(z.string(), {
      description:
        "System dependencies. AUTO-DETECT from framework if needed.",
    })
    .describe("OPTIONAL - system dependencies (if needed)")
    .default([]),

  is_auto_deploy: z
    .literal(false, {
      description: "Always false when creating via MCP server",
    })
    .default(false)
    .describe("REQUIRED - always false"),
};

const handler = async (params: CreateAppParams) => {
  try {
    const [providers, presets, deploySettings] = await Promise.all([
      appsApiClient.getVcsProviders(),
      appsApiClient.getAllowedPresets(),
      appsApiClient.getDeploySettings(),
    ]);
    const repositoryName = params.repository_url
      .split("/")
      .pop()
      ?.replace(".git", "");
    const provider = providers?.find(
      (provider) => repositoryName && provider.login.includes(repositoryName)
    );

    if (!provider) {
      return createToolResponse(
        `❌ VCS provider not found for "${params.repository_url}". Add one via tool ${ToolNames.ADD_VCS_PROVIDER}`
      );
    }

    if (!presets) {
      return createToolResponse(
        `❌ Failed to fetch presets for app "${params.name}"`
      );
    }

    const presetType =
      params.type === AppTypes.FRONTEND
        ? "frontend_presets"
        : "backend_presets";
    let preset = presets[presetType]?.find(
      (preset) => preset.id === params.preset_id
    );

    if (!preset) {
      preset = presets[presetType]?.[0];
    }
    if (!preset) {
      return createToolResponse(
        `❌ Invalid preset ID for app "${params.name}". Use resource ${ResourceNames.ALLOWED_PRESETS} to get available presets`
      );
    }

    const deploySetting = deploySettings?.find(
      (setting) => setting.framework === params.framework
    );

    const appData: any = {
      ...params,
      preset_id: preset.id,
      provider_id: provider.provider_id,
    };

    if (deploySetting) {
      appData.build_cmd = deploySetting.build_cmd;
      if (params.type === AppTypes.FRONTEND) {
        appData.index_dir = deploySetting.index_dir;
      } else {
        appData.run_cmd = deploySetting.run_cmd;
      }
    }

    appData.system_dependencies = params.system_dependencies || [];
    appData.envs = params.envs || {};

    const app = await appsApiClient.createApp(appData);

    if (!app) {
      return createToolResponse(
        `❌ Failed to create app "${params.name}"`
      );
    }

    return createToolResponse(`✅ App "${app.name}" created in Timeweb Cloud!

Name: ${app.name}
Type: ${app.type}
Framework: ${app.framework}
Branch: ${app.branch}
IP: ${app.ip}
${
  app.domains.length > 0
    ? `URL: ${app.domains[0].fqdn}`
    : ""
}
Preset: ${app.preset_id}
${
  app.configuration
    ? `Configuration: ${JSON.stringify(app.configuration)}`
    : ""
}
NOTE: Configure environment variables in Timeweb Cloud dashboard before use.`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return createToolResponse(
        `❌ Error creating app: ${error.message}`
      );
    }
    return createToolResponse(`❌ Unknown error creating app`);
  }
};

export const createAppTool: ToolDefinition = {
  name: ToolNames.CREATE_TIMEWEB_APP,
  title: "Create app in Timeweb Cloud",
  description: `Creates an app in Timeweb Cloud with auto-detected project parameters.`,
  annotations: {
    title: "Create app in Timeweb Cloud",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  inputSchema,
  handler,
};
