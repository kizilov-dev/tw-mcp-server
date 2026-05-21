import { z } from "zod";
import { createToolResponse, getPresetDatabaseType } from "../utils";
import { databaseApiClient } from "../api";
import { ToolNames } from "../types/tool-names.enum";
import { DatabaseTypes } from "../types/database-types.enum";
import { AvailabilityZones } from "../types/availability-zones.enum";
import { ResourceNames } from "../types/resource-names.enum";
import { ToolDefinition } from "../types/tool.type";

const inputSchema = {
  name: z
    .string({
      description: "Database name",
    })
    .min(3, "Name must be at least 3 characters")
    .describe("REQUIRED - database name"),
  type: z
    .nativeEnum(DatabaseTypes)
    .describe("REQUIRED - database type"),
  preset_id: z
    .number({
      description: "Database configuration preset ID",
    })
    .int("Preset ID must be an integer")
    .positive("Preset ID must be positive")
    .describe("REQUIRED - preset ID"),
  availability_zone: z
    .nativeEnum(AvailabilityZones)
    .describe("REQUIRED - availability zone"),
  admin_password: z
    .string({
      description: "Database admin password",
    })
    .min(8, "Password must be at least 8 characters")
    .describe("REQUIRED - admin password"),
  floating_ip: z
    .string({
      description: "Floating IP address for database connection",
    })
    .ip({
      version: "v4",
      message: "Floating IP must be a valid IPv4 address",
    })
    .describe("REQUIRED - floating IP address"),
  vpc_id: z
    .string({
      description: `Virtual private network (VPC) ID. Get VPC list from resource ${ResourceNames.GET_VPCS}`,
    })
    .min(1, "VPC ID cannot be empty")
    .describe("REQUIRED - VPC ID"),
  hash_type: z
    .string({
      description: "Password hashing type",
    })
    .default("caching_sha2")
    .describe(
      "OPTIONAL - hash type (default: caching_sha2)"
    ),
  auto_backups: z
    .boolean({
      description: "Enable automatic backups",
    })
    .default(true)
    .describe(
      "OPTIONAL - automatic backups (default: true)"
    ),
};

const handler = async (params: {
  name: string;
  type: DatabaseTypes;
  preset_id: number;
  availability_zone: AvailabilityZones;
  admin_password: string;
  floating_ip: string;
  vpc_id: string;
  hash_type?: "caching_sha2";
}) => {
  try {
    const allPresets = await databaseApiClient.getPresets();
    const availablePresets = allPresets.filter(preset => preset.type === getPresetDatabaseType(params.type));

    if (!availablePresets || !availablePresets.length) {
      return createToolResponse(
        `❌ Failed to fetch database presets. Verify database type "${params.type}" matches preset type`
      );
    }

    const preset = availablePresets.find(preset => preset.id === params.preset_id);

    if (!preset) {
      return createToolResponse(
        `❌ Invalid preset ID for database "${params.name}". Available presets for this type: ${JSON.stringify(availablePresets, null, 2)}`
      );
    }

    const db = await databaseApiClient.create({
      name: params.name,
      type: params.type,
      presetId: params.preset_id,
      availabilityZone: params.availability_zone,
      adminPassword: params.admin_password,
      floatingIp: params.floating_ip,
      vpcId: params.vpc_id,
      hashType: params.hash_type || "caching_sha2",
    });

    if (!db) {
      return createToolResponse(
        `❌ Failed to create database "${params.name}"`
      );
    }

    return createToolResponse(`✅ Database created

Name: ${db.name}
ID: ${db.id}
Type: ${db.type}
Status: ${db.status}
Port: ${db.port}
Availability zone: ${db.availability_zone}
Location: ${db.location}
Preset: ${db.preset_id}
Project: ${db.project_id}
Hash type: ${db.hash_type}
Public network: ${db.is_enabled_public_network ? "yes" : "no"}
Auto backups: ${db.is_autobackups_enabled ? "yes" : "no"}
Secure connection: ${db.is_secure_connection_enabled ? "yes" : "no"}
Created: ${new Date(db.created_at).toISOString()}
NOTE: Connection credentials will be available in Timeweb Cloud dashboard after provisioning.`);
  } catch (error) {
    if (error instanceof Error) {
      return createToolResponse(
        `❌ Error creating database: ${error.message}`
      );
    }
    return createToolResponse(`❌ Unknown error creating database`);
  }
};

export const createDatabaseTool: ToolDefinition = {
  name: ToolNames.CREATE_DATABASE,
  title: "Create database",
  description:
    "Creates a new database in Timeweb Cloud with specified parameters",
  annotations: {
    title: "Create database",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  inputSchema,
  handler,
};
