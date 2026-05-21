import { BaseApiClient } from "./client";
import { CreateDatabaseRequestDto } from "../types/dto/create-database-request.dto";
import { CreateDatabaseResponseDto } from "../types/dto/create-database-response.dto";
import { Database } from "../types/database.type";
import {
  DatabasePreset,
  DatabasePresetsResponse,
} from "../types/database-preset.type";
import { CreateDbParams } from "../types/create-db-params.type";

export class DatabaseApiClient extends BaseApiClient {
  async create({
    name,
    type,
    presetId,
    availabilityZone,
    adminPassword,
    floatingIp,
    vpcId,
    hashType,
  }: CreateDbParams): Promise<Database> {
    const requestData: CreateDatabaseRequestDto = {
      admin: {
        password: adminPassword,
        for_all: false,
      },
      name,
      type,
      preset_id: presetId,
      availability_zone: availabilityZone,
      hash_type: hashType,
      auto_backups: {
        copy_count: 1,
        creation_start_at: new Date().toISOString(),
        interval: "day",
        day_of_week: 5,
      },
      network: {
        floating_ip: floatingIp,
        id: vpcId,
      },
    };

    const response = await this.post<CreateDatabaseResponseDto>(
      "/api/v1/databases",
      requestData
    );
    return response.db;
  }

  async getPresets(): Promise<DatabasePreset[]> {
    const response = await this.get<DatabasePresetsResponse>(
      "/api/v2/presets/dbs"
    );
    return response.databases_presets;
  }
}

export const databaseApiClient = new DatabaseApiClient();
