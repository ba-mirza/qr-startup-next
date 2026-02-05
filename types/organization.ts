export interface OrganizationSettings {
  geolocation_required: boolean;
  geolocation_radius: number;
  auto_close_day: boolean;
}

export interface GeoLocation {
  lat: number;
  lng: number;
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

export interface OfficePoint {
  id: string;
  organization_id: string;
  name: string;
  address: string | null;
  qr_token: string;
  is_main: boolean;
  geo_location: GeoLocation | null;
  is_active: boolean;
  created_at: string;
}

export interface OrganizationWithOffices extends Organization {
  office_points: OfficePoint[];
}

export interface CreateOrganizationInput {
  name: string;
  bin: string;
  address: string;
}

export interface OrganizationResponse {
  data: Organization | null;
  error: string | null;
}
