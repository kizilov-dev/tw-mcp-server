#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as tools from "./tools";
import * as resources from "./resources";
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
      },
    }
  );

  // Регистрируем tools
  Object.values(tools).forEach((tool) => {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
        // outputSchema: tool.outputSchema,
        annotations: {
          title: tool.title,
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
      },
      tool.handler
    );
  });

  // Регистрируем resources
  Object.values(resources).forEach((resource) => {
    server.registerResource(
      resource.name,
      resource.uri,
      {
        title: resource.title,
        description: resource.description,
      },
      resource.handler
    );
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
