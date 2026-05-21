import { z } from "zod";

export interface ToolAnnotations {
  [key: string]: unknown;
  title: string;
  readOnlyHint: boolean;
  destructiveHint: boolean;
  idempotentHint: boolean;
  openWorldHint: boolean;
}

export interface ToolDefinition<T extends Record<string, z.ZodType> = Record<string, z.ZodType>> {
  name: string;
  title: string;
  description: string;
  annotations: ToolAnnotations;
  inputSchema: T;
  handler: (params: any) => Promise<{ content: { type: "text"; text: string }[] }>;
}
