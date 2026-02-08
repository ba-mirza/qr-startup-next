export type TimePeriod = "1h" | "6h" | "24h" | "3day" | "7day";

export interface RegistrationQR {
  id: string;
  organization_id: string;
  token: string;
  expires_at: string;
  is_active: boolean;
  time_period: TimePeriod;
  created_at: string;
}

export interface CreateRegistrationQRInput {
  time_period: TimePeriod;
}
