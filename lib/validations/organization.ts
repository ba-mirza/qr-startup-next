import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, "Название организации обязательно")
    .min(2, "Название должно содержать минимум 2 символа")
    .max(100, "Название не должно превышать 100 символов"),
  bin: z
    .string()
    .min(1, "БИН обязателен")
    .length(12, "БИН должен содержать 12 цифр")
    .regex(/^\d+$/, "БИН должен содержать только цифры"),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
