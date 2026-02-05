export type EmployeeStatus = "pending" | "active" | "inactive";

export interface Employee {
  id: string;
  organization_id: string;
  user_id: string | null;
  full_name: string;
  position: string | null;
  phone: string | null;
  email: string | null;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
}

export interface EmployeeWithUser extends Employee {
  user?: {
    email: string;
    full_name: string | null;
  };
}
