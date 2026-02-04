"use server";

import { createClient } from "@/lib/supabase/server";
import { createOrganizationSchema } from "@/lib/validations/organization";
import type { Organization } from "@/types/organization";

const generateSlug = (name: string): string => {
  const base = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
};

export const getUserOrganization = async (): Promise<{
  data: Organization | null;
  error: string | null;
}> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Не авторизован" };
  }

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return { data: null, error: "Ошибка загрузки организации" };
  }

  return { data: data as Organization | null, error: null };
};

export const createOrganization = async (formData: FormData): Promise<{
  data: Organization | null;
  error: string | null;
}> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Не авторизован" };
  }

  const input = {
    name: formData.get("name") as string,
    bin: formData.get("bin") as string,
  };

  const validation = createOrganizationSchema.safeParse(input);

  if (!validation.success) {
    return { data: null, error: validation.error.issues[0]?.message || "Ошибка валидации" };
  }

  const { data: existing } = await supabase
    .from("organizations")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return { data: null, error: "У вас уже есть организация" };
  }

  const slug = generateSlug(input.name);

  const { data, error } = await supabase
    .from("organizations")
    .insert({
      user_id: user.id,
      name: input.name,
      bin: input.bin,
      slug,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { data: null, error: "Организация с таким БИН уже существует" };
    }
    return { data: null, error: "Ошибка создания организации" };
  }

  return { data: data as Organization, error: null };
};

export const getOrganizationBySlug = async (slug: string): Promise<{
  data: Organization | null;
  error: string | null;
}> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Не авторизован" };
  }

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return { data: null, error: "Организация не найдена" };
  }

  return { data: data as Organization, error: null };
};
