import type { Enums } from "@/shared/api/supabase";

export type TaxIdType = Enums<"tax_id_type">;
export type MemberRole = Enums<"member_role">;

export type Organization = {
  id: string;
  name: string;
  slug: string;
  taxId: string;
  taxIdType: TaxIdType;
  timezone: string;
};

export type Membership = { organization: Organization; role: MemberRole };
