import { BaseApiClient } from "./client";
import { CreateVpcRequestDto } from "../types/dto/create-vpc-request.dto";
import { CreateVpcResponseDto } from "../types/dto/create-vpc-response.dto";
import { GetVpcsResponseDto } from "../types/dto/get-vpcs-response.dto";
import { AvailabilityZones } from "../types/availability-zones.enum";
import { Vpc } from "../types/vpc.type";

export class VpcApiClient extends BaseApiClient {
  async create(
    availabilityZone: AvailabilityZones,
    name: string,
    subnetV4: string
  ): Promise<Vpc> {
    const requestData: CreateVpcRequestDto = {
      availability_zone: availabilityZone,
      name,
      subnet_v4: subnetV4,
    };

    const response = await this.post<CreateVpcResponseDto>(
      "/api/v2/vpcs",
      requestData
    );
    return response.vpc;
  }

  async getAll(): Promise<Vpc[]> {
    const response = await this.get<GetVpcsResponseDto>("/api/v2/vpcs");
    return response.vpcs;
  }
}

export const vpcApiClient = new VpcApiClient();
