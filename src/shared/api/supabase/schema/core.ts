// Ядро: таблицы и функции из миграций *_core*.sql. Формат — как у `supabase gen types`.

export type CoreEnums = {
  tax_id_type: "bin" | "iin";
  member_role: "owner" | "cashier";
  org_module_status: "setup" | "active" | "expired";
};

type OrganizationRow = {
  id: string;
  name: string;
  tax_id: string;
  tax_id_type: CoreEnums["tax_id_type"];
  slug: string;
  timezone: string;
  created_by: string;
  created_at: string;
};

type OrgModuleRow = {
  organization_id: string;
  module: string;
  status: CoreEnums["org_module_status"];
  active_until: string | null;
  trial_used: boolean;
  created_at: string;
};

export type CoreTables = {
  modules: {
    Row: {
      key: string;
      name: string;
      description: string;
      price_monthly: number | null;
      trial_days: number;
      is_available: boolean;
      sort_order: number;
      created_at: string;
    };
    Insert: never;
    Update: never;
    Relationships: [];
  };
  organizations: {
    Row: OrganizationRow;
    Insert: never;
    Update: { name?: string; timezone?: string };
    Relationships: [];
  };
  points: {
    Row: {
      id: string;
      organization_id: string;
      name: string;
      address: string | null;
      latitude: number | null;
      longitude: number | null;
      is_main: boolean;
      is_active: boolean;
      created_at: string;
    };
    Insert: {
      id?: string;
      organization_id: string;
      name: string;
      address?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      is_active?: boolean;
    };
    Update: {
      name?: string;
      address?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      is_active?: boolean;
    };
    Relationships: [
      {
        foreignKeyName: "points_organization_id_fkey";
        columns: ["organization_id"];
        isOneToOne: false;
        referencedRelation: "organizations";
        referencedColumns: ["id"];
      },
    ];
  };
  org_members: {
    Row: {
      id: string;
      organization_id: string;
      user_id: string;
      role: CoreEnums["member_role"];
      point_id: string | null;
      is_active: boolean;
      created_at: string;
    };
    Insert: never;
    Update: never;
    Relationships: [
      {
        foreignKeyName: "org_members_organization_id_fkey";
        columns: ["organization_id"];
        isOneToOne: false;
        referencedRelation: "organizations";
        referencedColumns: ["id"];
      },
      {
        foreignKeyName: "org_members_point_id_fkey";
        columns: ["point_id"];
        isOneToOne: false;
        referencedRelation: "points";
        referencedColumns: ["id"];
      },
    ];
  };
  qr_codes: {
    Row: {
      id: string;
      organization_id: string;
      point_id: string | null;
      module: string;
      purpose: string;
      token: string;
      expires_at: string | null;
      is_active: boolean;
      created_at: string;
    };
    Insert: {
      organization_id: string;
      point_id?: string | null;
      module: string;
      purpose: string;
      expires_at?: string | null;
    };
    Update: { expires_at?: string | null; is_active?: boolean };
    Relationships: [
      {
        foreignKeyName: "qr_codes_organization_id_fkey";
        columns: ["organization_id"];
        isOneToOne: false;
        referencedRelation: "organizations";
        referencedColumns: ["id"];
      },
      {
        foreignKeyName: "qr_codes_point_id_fkey";
        columns: ["point_id"];
        isOneToOne: false;
        referencedRelation: "points";
        referencedColumns: ["id"];
      },
      {
        foreignKeyName: "qr_codes_module_fkey";
        columns: ["module"];
        isOneToOne: false;
        referencedRelation: "modules";
        referencedColumns: ["key"];
      },
    ];
  };
  org_modules: {
    Row: OrgModuleRow;
    Insert: never;
    Update: never;
    Relationships: [
      {
        foreignKeyName: "org_modules_organization_id_fkey";
        columns: ["organization_id"];
        isOneToOne: false;
        referencedRelation: "organizations";
        referencedColumns: ["id"];
      },
      {
        foreignKeyName: "org_modules_module_fkey";
        columns: ["module"];
        isOneToOne: false;
        referencedRelation: "modules";
        referencedColumns: ["key"];
      },
    ];
  };
};

export type CoreFunctions = {
  resolve_qr: {
    Args: { p_token: string };
    Returns: { module: string; purpose: string };
  };
  create_organization: {
    Args: {
      p_name: string;
      p_tax_id: string;
      p_tax_id_type: CoreEnums["tax_id_type"];
      p_timezone?: string;
    };
    Returns: OrganizationRow;
  };
  start_module_trial: {
    Args: { p_organization_id: string; p_module: string };
    Returns: OrgModuleRow;
  };
  is_org_member: {
    Args: { org: string; roles?: CoreEnums["member_role"][] };
    Returns: boolean;
  };
  has_module: {
    Args: { org: string; module_key: string };
    Returns: boolean;
  };
};
