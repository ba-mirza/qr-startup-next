import type { Supabase, Tables } from "@/shared/api/supabase";

import type { Membership, Organization, TaxIdType } from "../model/types";

const toOrganization = (row: Tables<"organizations">): Organization => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  taxId: row.tax_id,
  taxIdType: row.tax_id_type,
  timezone: row.timezone,
});

export type CreateOrganizationErrorKey = "invalidName" | "invalidTaxId" | "taxIdTaken" | "unknown";

const CREATE_ERRORS: Record<string, CreateOrganizationErrorKey> = {
  invalid_name: "invalidName",
  invalid_tax_id: "invalidTaxId",
  tax_id_taken: "taxIdTaken",
};

export class CreateOrganizationError extends Error {
  constructor(readonly key: CreateOrganizationErrorKey) {
    super(key);
  }
}

export const organizationApi = {
  // Организации, где пользователь — активный участник. RLS отдаёт только их.
  listMine: async (client: Supabase): Promise<Membership[]> => {
    const { data, error } = await client
      .from("org_members")
      .select("role, organization:organizations(*)")
      .eq("is_active", true)
      .order("created_at");
    if (error) throw error;
    return data.flatMap((row) =>
      row.organization ? [{ role: row.role, organization: toOrganization(row.organization) }] : [],
    );
  },

  getBySlug: async (client: Supabase, slug: string): Promise<Organization | null> => {
    const { data, error } = await client
      .from("organizations")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? toOrganization(data) : null;
  },

  create: async (
    client: Supabase,
    input: { name: string; taxId: string; taxIdType: TaxIdType },
  ): Promise<Organization> => {
    const { data, error } = await client.rpc("create_organization", {
      p_name: input.name,
      p_tax_id: input.taxId,
      p_tax_id_type: input.taxIdType,
    });
    if (error) throw new CreateOrganizationError(CREATE_ERRORS[error.message] ?? "unknown");
    return toOrganization(data);
  },
};
