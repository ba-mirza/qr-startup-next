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
  address: z
    .string()
    .min(1, "Адрес главного офиса обязателен")
    .min(5, "Адрес должен содержать минимум 5 символов")
    .max(200, "Адрес не должен превышать 200 символов"),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
