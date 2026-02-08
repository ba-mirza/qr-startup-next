export interface RegistrationQR {
  id: string;
  office_point_id: string;
  token: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateRegistrationQRInput {
  expires_in_hours: number;
}
