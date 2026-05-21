export interface ResourceDefinition {
  name: string;
  uri: string;
  title: string;
  description: string;
  handler: (uri: URL, ...args: any[]) => Promise<{
    contents: { uri: string; text: string; mimeType: string }[];
  }>;
}
