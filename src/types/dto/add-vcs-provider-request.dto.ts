export interface AddVcsProviderRequestDto {
  provider_type: "git";
  url: string;
  login?: string;
  password?: string;
}
