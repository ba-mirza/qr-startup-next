export interface OrganizationSettings {
  geolocation_required: boolean;
  geolocation_radius: number;
  auto_close_day: boolean;
}

export interface Organization {
  id: string;
  user_id: string;
  name: string;
  bin: string;
  bin_verified: boolean;
  slug: string;
  settings: OrganizationSettings;
  created_at: string;
  updated_at: string;
}

export interface CreateOrganizationInput {
  name: string;
  bin: string;
}

export interface OrganizationResponse {
  data: Organization | null;
  error: string | null;
}
