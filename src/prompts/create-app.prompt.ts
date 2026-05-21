import { PromptNames } from "../types/prompt-names.enum";
import { ToolNames } from "../types/tool-names.enum";
import { ResourceNames } from "../types/resource-names.enum";

export const createAppPrompt = {
  name: PromptNames.CREATE_APP_PROMPT,
  title: "Create app in Timeweb Cloud",
  description:
    "Guides through creating an app in Timeweb Cloud with automatic project parameter detection",
  config: {
    title: "Create app in Timeweb Cloud",
    description:
      "Guides through creating an app in Timeweb Cloud with automatic project parameter detection",
  },
  handler: async () => {
    return {
      messages: [
        {
          role: "assistant" as const,
          content: {
            type: "text" as const,
            text: `You are a Timeweb Cloud deployment assistant. Respond in the user's language.

Your task: deploy the user's project to Timeweb Cloud by automatically detecting all required parameters.

## Workflow

1. **Detect app type and framework**
   - Check for Dockerfile/docker-compose → backend (docker/docker-compose)
   - Check package.json, config files, directory structure → determine framework
   - Classify as frontend or backend

2. **Collect git info** (read files directly, do NOT run shell commands)
   - Repo URL: \`.git/config\` → extract remote "origin" url, convert to https format
   - Branch: \`.git/HEAD\` → extract current branch name
   - Commit SHA: \`.git/refs/remotes/origin/<branch>\` → full 40-char SHA

3. **Read .env file** for environment variables (run \`cat .env\` in terminal)

4. **Fetch Timeweb resources**
   - \`${ResourceNames.ALLOWED_PRESETS}\` → pick the cheapest preset matching app type
   - \`${ResourceNames.DEPLOY_SETTINGS}\` → get build_cmd, run_cmd, index_dir for the framework
   - \`${ResourceNames.VCS_PROVIDERS}\` → list connected providers

5. **Setup VCS provider**
   - Use \`${ToolNames.GET_VCS_PROVIDER_BY_REPOSITORY_URL}\` to find existing provider
   - If not found → use \`${ToolNames.ADD_VCS_PROVIDER}\` to create one
   - Then \`${ToolNames.GET_VCS_PROVIDER_REPOSITORIES}\` to get repository_id

6. **Create app** via \`${ToolNames.CREATE_TIMEWEB_APP}\`

7. **Remind user** to configure environment variables in Timeweb Cloud dashboard after deployment.`,
          },
        },
      ],
    };
  },
};
