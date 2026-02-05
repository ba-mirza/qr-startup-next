import type { Employee } from "./employee";
import type { OfficePoint } from "./organization";

export type CheckType = "check_in" | "check_out";

export interface CheckLog {
  id: string;
  employee_id: string;
  office_point_id: string;
  check_type: CheckType;
  checked_at: string;
  geo_location: {
    lat: number;
    lng: number;
  } | null;
  device_info: string | null;
  created_at: string;
}

export interface CheckLogWithRelations extends CheckLog {
  employee: Pick<Employee, "id" | "full_name" | "position">;
  office_point: Pick<OfficePoint, "id" | "name">;
}

export interface CheckLogsFilter {
  date: string | null;
  employeeId: string | null;
  officePointId: string | null;
  checkType: CheckType | null;
}
