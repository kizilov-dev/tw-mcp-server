import { appsApiClient } from "../api";
import { AddVcsProviderRequestDto } from "../types/dto/add-vcs-provider-request.dto";

export const addVcsProviderAction = async (
  params: AddVcsProviderRequestDto
) => {
  console.log("🚀 Добавление VCS провайдера...");

  const response = await appsApiClient.addVcsProvider(params);

  console.log("✅ VCS провайдер успешно добавлен");

  return response?.provider || null;
};
