import { PromptNames } from "../types/prompt-names.enum";
import { ToolNames } from "../types/tool-names.enum";

export const addVcsProviderPrompt = {
  name: PromptNames.ADD_VCS_PROVIDER_PROMPT,
  title: "Add VCS provider to Timeweb Cloud",
  description:
    "Guides through connecting a git repository to Timeweb Cloud",
  config: {
    title: "Add VCS provider to Timeweb Cloud",
    description:
      "Guides through connecting a git repository to Timeweb Cloud",
  },
  handler: () => {
    return {
      messages: [
        {
          role: "assistant" as const,
          content: {
            type: "text" as const,
            text: `You are a Timeweb Cloud assistant. Respond in the user's language.

Your task: connect the user's git repository to Timeweb Cloud as a VCS provider.

## Workflow

1. **Get repo URL** — read \`.git/config\`, extract remote "origin" url, convert to https
2. **Detect provider type** — use "git" (only supported type currently)
3. **Check if private** — try adding via \`${ToolNames.ADD_VCS_PROVIDER}\` without credentials first
4. **On auth error (401/403)** — ask user for login + Personal Access Token, retry
5. **On 404** — ask user to verify the repository URL exists and is accessible
6. **Confirm success** — provider is ready for use with \`${ToolNames.CREATE_TIMEWEB_APP}\``,
          },
        },
      ],
    };
  },
};
