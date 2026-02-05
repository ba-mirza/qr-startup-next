export interface RegistrationQR {
  id: string;
  organization_id: string;
  token: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateRegistrationQRInput {
  expires_in_hours: number;
}
