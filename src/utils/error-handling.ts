import { createToolResponse, createResourceResponse } from "../utils";

export function withToolErrorHandling(
  entityName: string,
  handler: (params: any) => Promise<{ content: { type: "text"; text: string }[] }>
) {
  return async (params: any) => {
    try {
      return await handler(params);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return createToolResponse(
          `Error: ${entityName} failed. ${error.message}`
        );
      }
      return createToolResponse(`Error: ${entityName} failed (unknown error)`);
    }
  };
}

export function withResourceErrorHandling(
  entityName: string,
  handler: (uri: URL, ...args: any[]) => Promise<{
    contents: { uri: string; text: string; mimeType: string }[];
  }>
) {
  return async (uri: URL, ...args: any[]) => {
    try {
      return await handler(uri, ...args);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return createResourceResponse(
          uri.href,
          `Failed to fetch ${entityName}. ${error.message}`
        );
      }
      return createResourceResponse(
        uri.href,
        `Failed to fetch ${entityName}`
      );
    }
  };
}
