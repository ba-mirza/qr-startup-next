"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = loginSchema.safeParse(data);

  if (!result.success) {
    return { error: "Неверные данные формы" };
  }

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: getAuthErrorMessage(error.message) };
  }

  redirect("/dashboard");
}

export async function register(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const result = registerSchema.safeParse(data);

  if (!result.success) {
    return { error: "Неверные данные формы" };
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error: getAuthErrorMessage(error.message) };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") || headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = origin?.startsWith("http") ? origin : `${protocol}://${origin}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: getAuthErrorMessage(error.message) };
  }

  return { url: data.url };
}

function getAuthErrorMessage(message: string): string {
  const errorMessages: Record<string, string> = {
    "Invalid login credentials": "Неверный email или пароль",
    "Email not confirmed": "Email не подтвержден",
    "User already registered": "Пользователь с таким email уже существует",
    "Password should be at least 6 characters":
      "Пароль должен содержать минимум 6 символов",
    "Unable to validate email address: invalid format":
      "Неверный формат email",
  };

  return errorMessages[message] || "Произошла ошибка. Попробуйте еще раз";
}
