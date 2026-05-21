import { z } from "zod";
import { createToolResponse } from "../utils";
import { ToolNames } from "../types/tool-names.enum";
import { floatingIpApiClient } from "../api";
import { AvailabilityZones } from "../types/availability-zones.enum";
import { withToolErrorHandling } from "../utils/error-handling";
import { ToolDefinition } from "../types/tool.type";

const inputSchema = {
  availability_zone: z.nativeEnum(AvailabilityZones)
    .describe("REQUIRED - availability zone"),
  is_ddos_guard: z
    .boolean({
      description: "Enable DDoS protection for floating IP",
    })
    .default(false)
    .describe("OPTIONAL - DDoS protection (default: false)"),
};

const handler = withToolErrorHandling("creating floating IP", async (params: {
  availability_zone: AvailabilityZones;
  is_ddos_guard?: boolean;
}) => {
  const ip = await floatingIpApiClient.create(
    params.availability_zone,
    params.is_ddos_guard || false
  );

  if (!ip) {
    return createToolResponse(
      `❌ Failed to create floating IP in zone "${params.availability_zone}"`
    );
  }

  return createToolResponse(`✅ Floating IP created

IP: ${ip.ip}
ID: ${ip.id}
Availability zone: ${ip.availability_zone}
DDoS Guard: ${ip.is_ddos_guard ? "enabled" : "disabled"}
Comment: ${ip.comment || "none"}
Created: ${new Date(ip.created_at).toISOString()}`);
});

export const createFloatingIpTool: ToolDefinition = {
  name: ToolNames.CREATE_FLOATING_IP,
  title: "Create Floating IP",
  description: "Creates a new floating IP address in specified availability zone",
  annotations: {
    title: "Create Floating IP",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  inputSchema,
  handler,
};
