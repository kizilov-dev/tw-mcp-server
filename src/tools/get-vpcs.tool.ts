import { createToolResponse } from "../utils";
import { vpcApiClient } from "../api";
import { ToolNames } from "../types/tool-names.enum";
import { withToolErrorHandling } from "../utils/error-handling";
import { ToolDefinition } from "../types/tool.type";

const handler = withToolErrorHandling("fetching VPCs", async () => {
  const vpcs = await vpcApiClient.getAll();

  if (!vpcs || vpcs.length === 0) {
    return createToolResponse(
      `No VPCs found. Create one via tool ${ToolNames.CREATE_VPC}`
    );
  }

  return createToolResponse(`VPCs:

    ${JSON.stringify(vpcs, null, 2)}

    Total: ${vpcs.length}`);
});

export const getVpcsTool: ToolDefinition = {
  name: ToolNames.GET_VPCS,
  title: "Get VPCs",
  description:
    "Gets list of all user virtual private networks (VPCs)",
  annotations: {
    title: "Get VPCs",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  inputSchema: {},
  handler,
};
