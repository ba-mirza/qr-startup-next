// Пишется вручную по supabase/migrations в формате `supabase gen types typescript`.
// Меняешь миграцию — обнови этот файл в том же PR.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type OrganizationRow = {
  id: string;
  name: string;
  tax_id: string;
  tax_id_type: Database["public"]["Enums"]["tax_id_type"];
  slug: string;
  timezone: string;
  created_by: string;
  created_at: string;
};

type OrgModuleRow = {
  organization_id: string;
  module: string;
  status: Database["public"]["Enums"]["org_module_status"];
  active_until: string | null;
  trial_used: boolean;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
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
          role: Database["public"]["Enums"]["member_role"];
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
    Views: { [_ in never]: never };
    Functions: {
      create_organization: {
        Args: {
          p_name: string;
          p_tax_id: string;
          p_tax_id_type: Database["public"]["Enums"]["tax_id_type"];
          p_timezone?: string;
        };
        Returns: OrganizationRow;
      };
      start_module_trial: {
        Args: { p_organization_id: string; p_module: string };
        Returns: OrgModuleRow;
      };
      is_org_member: {
        Args: { org: string; roles?: Database["public"]["Enums"]["member_role"][] };
        Returns: boolean;
      };
      has_module: {
        Args: { org: string; module_key: string };
        Returns: boolean;
      };
    };
    Enums: {
      tax_id_type: "bin" | "iin";
      member_role: "owner" | "cashier";
      org_module_status: "setup" | "active" | "expired";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
