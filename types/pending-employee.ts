import type { OfficePoint } from "./organization";

export type PendingEmployeeStatus = "pending" | "approved" | "rejected";

export interface PendingEmployee {
  id: string;
  office_point_id: string;
  registration_token: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  device_fingerprint: string;
  status: PendingEmployeeStatus;
  registered_at: string;
}

export interface PendingEmployeeWithOffice extends PendingEmployee {
  office_point: Pick<OfficePoint, "id" | "name" | "organization_id">;
}
