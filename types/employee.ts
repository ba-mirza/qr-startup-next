export interface Employee {
  id: string;
  organization_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  device_fingerprint: string | null;
  is_active: boolean;
  created_at: string;
}
