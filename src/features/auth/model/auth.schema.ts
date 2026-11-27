import { z } from "zod";

// Сообщения — ключи из messages/*.json (namespace auth.errors), переводятся в UI.
export const loginSchema = z.object({
  email: z.email("emailInvalid").trim().toLowerCase(),
  password: z.string().min(1, "passwordShort"),
});

export const registerSchema = z
  .object({
    email: z.email("emailInvalid").trim().toLowerCase(),
    password: z.string().min(8, "passwordShort"),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "passwordMismatch",
    path: ["passwordConfirm"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type AuthErrorKey =
  | "invalidCredentials"
  | "emailNotConfirmed"
  | "userExists"
  | "weakPassword"
  | "rateLimit"
  | "unknown";
