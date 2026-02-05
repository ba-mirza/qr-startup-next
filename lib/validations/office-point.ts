import { z } from "zod";

export const createOfficePointSchema = z.object({
  name: z
    .string()
    .min(1, "Название точки обязательно")
    .min(2, "Название должно содержать минимум 2 символа")
    .max(100, "Название не должно превышать 100 символов"),
  address: z
    .string()
    .max(200, "Адрес не должен превышать 200 символов")
    .optional()
    .or(z.literal("")),
});

export type CreateOfficePointInput = z.infer<typeof createOfficePointSchema>;

export const updateOrganizationSettingsSchema = z.object({
  geolocation_required: z.boolean(),
  geolocation_radius: z.number().min(10).max(1000),
  auto_close_day: z.boolean(),
});

export type UpdateOrganizationSettingsInput = z.infer<typeof updateOrganizationSettingsSchema>;
