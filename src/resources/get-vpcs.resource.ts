import { vpcApiClient } from "../api";
import { ResourceNames } from "../types/resource-names.enum";
import { createResourceResponse } from "../utils";
import { withResourceErrorHandling } from "../utils/error-handling";
import { ToolNames } from "../types/tool-names.enum";

export const getVpcsResource = {
  name: ResourceNames.GET_VPCS,
  uri: "vpc://all",
  title: "User VPCs",
  description: "Virtual private networks (VPC) in Timeweb Cloud",
  handler: withResourceErrorHandling("VPCs", async (uri: URL) => {
    const result = await vpcApiClient.getAll();

    if (!result || result.length === 0) {
      return createResourceResponse(uri.href, `No VPCs found. Create one via tool ${ToolNames.CREATE_VPC}`);
    }

    return createResourceResponse(uri.href, JSON.stringify(result, null, 2));
  }),
};
