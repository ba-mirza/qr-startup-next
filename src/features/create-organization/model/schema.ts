import { z } from "zod";

import { isValidKzTaxId } from "@/shared/lib/kz-tax-id";

// Сообщения — ключи onboarding.errors.
export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2, "nameShort").max(120, "nameShort"),
  taxIdType: z.enum(["bin", "iin"]),
  taxId: z.string().trim().refine(isValidKzTaxId, "invalidTaxId"),
});

export type CreateOrganizationValues = z.infer<typeof createOrganizationSchema>;
