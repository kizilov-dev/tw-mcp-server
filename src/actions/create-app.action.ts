import { appsApiClient } from "../api";
import { CreateAppParams } from "../types/create-app-params.type";

export const createAppAction = async (params: CreateAppParams) => {
  const response = await appsApiClient.createApp(params);

  return response?.app || null;
};
