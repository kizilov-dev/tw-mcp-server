import { z } from "zod";
import { createToolResponse } from "../utils";
import { vpcApiClient } from "../api";
import { ToolNames } from "../types/tool-names.enum";
import { AvailabilityZones } from "../types/availability-zones.enum";
import { withToolErrorHandling } from "../utils/error-handling";
import { ToolDefinition } from "../types/tool.type";

const inputSchema = {
  availability_zone: z
    .nativeEnum(AvailabilityZones)
    .describe("REQUIRED - availability zone"),
  name: z
    .string({
      description: "Virtual private network name",
    })
    .describe("VPC name")
    .default(""),
  subnet_v4: z
    .string({
      description: "IPv4 subnet in CIDR format (e.g. 192.168.0.0/24)",
    })
    .regex(
      /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/,
      "Subnet must be in CIDR format (e.g. 192.168.0.0/24)"
    )
    .describe("REQUIRED - IPv4 subnet in CIDR format"),
};

const handler = withToolErrorHandling("creating VPC", async (params: {
  availability_zone: AvailabilityZones;
  name: string;
  subnet_v4: string;
}) => {
  const vpc = await vpcApiClient.create(
    params.availability_zone,
    params.name,
    params.subnet_v4
  );

  if (!vpc) {
    return createToolResponse(
      `❌ Failed to create VPC "${params.name}" in zone "${params.availability_zone}"`
    );
  }

  return createToolResponse(`✅ VPC created

Name: ${vpc.name}
ID: ${vpc.id}
Availability zone: ${vpc.availability_zone}
Location: ${vpc.location}
Subnet IPv4: ${vpc.subnet_v4}
Type: ${vpc.type}
Description: ${vpc.description || "none"}
Public IP: ${vpc.public_ip || "none"}
Created: ${new Date(vpc.created_at).toISOString()}
Busy addresses: ${vpc.busy_address.join(", ")}`);
});

export const createVpcTool: ToolDefinition = {
  name: ToolNames.CREATE_VPC,
  title: "Create VPC",
  description:
    "Creates a new virtual private network in specified availability zone",
  annotations: {
    title: "Create VPC",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  inputSchema,
  handler,
};
