import type { AuthError } from "@supabase/supabase-js";

import { getSupabase } from "@/shared/api/supabase/client";

import type { AuthErrorKey, LoginValues, RegisterValues } from "../model/auth.schema";

const ERROR_KEYS: Record<string, AuthErrorKey> = {
  invalid_credentials: "invalidCredentials",
  email_not_confirmed: "emailNotConfirmed",
  user_already_exists: "userExists",
  email_exists: "userExists",
  weak_password: "weakPassword",
  over_email_send_rate_limit: "rateLimit",
  over_request_rate_limit: "rateLimit",
};

export class AuthRequestError extends Error {
  constructor(readonly key: AuthErrorKey) {
    super(key);
  }
}

const toAuthError = (error: AuthError) =>
  new AuthRequestError(ERROR_KEYS[error.code ?? ""] ?? "unknown");

export const authApi = {
  signIn: async ({ email, password }: LoginValues) => {
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) throw toAuthError(error);
  },

  // Возвращает true, если Supabase требует подтверждения email (сессии ещё нет).
  signUp: async ({ email, password }: RegisterValues) => {
    const { data, error } = await getSupabase().auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    });
    if (error) throw toAuthError(error);
    // Supabase не раскрывает занятый email: вернёт пользователя без identities.
    if (data.user && data.user.identities?.length === 0) throw new AuthRequestError("userExists");
    return { needsConfirmation: !data.session };
  },

  signOut: async () => {
    await getSupabase().auth.signOut();
  },
};
