export interface PromptDefinition {
  name: string;
  title: string;
  description: string;
  config: {
    title: string;
    description: string;
  };
  handler: () =>
    | Promise<{ messages: { role: "assistant" | "user"; content: { type: "text"; text: string } }[] }>
    | { messages: { role: "assistant" | "user"; content: { type: "text"; text: string } }[] };
}
