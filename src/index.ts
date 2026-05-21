#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as tools from "./tools";
import * as resources from "./resources";
import * as prompts from "./prompts";
import { getVersion } from "./utils";

const startServer = async () => {
  const server = new McpServer(
    {
      name: "timeweb-mcp-server",
      title: "Timeweb MCP Server",
      version: getVersion(),
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    }
  );

  Object.values(tools).forEach((tool) => {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: tool.annotations,
      },
      tool.handler
    );
  });

  Object.values(resources).forEach((resource) => {
    const isTemplate = resource.uri.includes("{");
    const uriOrTemplate = isTemplate
      ? new ResourceTemplate(resource.uri, { list: undefined })
      : resource.uri;

    server.registerResource(
      resource.name,
      uriOrTemplate as any,
      {
        title: resource.title,
        description: resource.description,
      },
      resource.handler as any
    );
  });

  Object.values(prompts).forEach((prompt) => {
    server.registerPrompt(prompt.name, prompt.config, prompt.handler);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
};

startServer()
  .then(() => {
    console.log("Timeweb MCP server started");
  })
  .catch((error) => {
    console.error("Failed to start Timeweb MCP server:", error);
    process.exit(1);
  });
