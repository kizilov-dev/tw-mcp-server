import { BaseApiClient } from "./client";
import { CreateFloatingIpRequestDto } from "../types/dto/create-floating-ip-request.dto";
import { CreateFloatingIpResponseDto } from "../types/dto/create-floating-ip-response.dto";
import { AvailabilityZones } from "../types/availability-zones.enum";
import { FloatingIp } from "../types/floating-ip.type";

export class FloatingIpApiClient extends BaseApiClient {
  async create(
    availabilityZone: AvailabilityZones,
    isDdosGuard: boolean = false
  ): Promise<FloatingIp> {
    const requestData: CreateFloatingIpRequestDto = {
      availability_zone: availabilityZone,
      is_ddos_guard: isDdosGuard,
    };

    const response = await this.post<CreateFloatingIpResponseDto>(
      "/api/v1/floating-ips",
      requestData
    );
    return response.ip;
  }
}

export const floatingIpApiClient = new FloatingIpApiClient();
