"use server";

import { createClient } from "@/lib/supabase/server";
import { createOrganizationSchema } from "@/lib/validations/organization";
import { createOfficePointSchema, updateOrganizationSettingsSchema } from "@/lib/validations/office-point";
import type { Organization, OrganizationWithOffices, OfficePoint, OrganizationSettings } from "@/types/organization";
import type { RegistrationQR } from "@/types/registration-qr";

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

const generateQrToken = (): string => {
  return crypto.randomUUID();
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
    address: formData.get("address") as string,
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

  const { data: orgData, error: orgError } = await supabase
    .from("organizations")
    .insert({
      user_id: user.id,
      name: input.name,
      bin: input.bin,
      slug,
    })
    .select()
    .single();

  if (orgError) {
    if (orgError.code === "23505") {
      return { data: null, error: "Организация с таким БИН уже существует" };
    }
    return { data: null, error: "Ошибка создания организации" };
  }

  const qrToken = generateQrToken();

  const { error: officeError } = await supabase
    .from("office_points")
    .insert({
      organization_id: orgData.id,
      name: "Главный офис",
      address: input.address,
      qr_token: qrToken,
      is_main: true,
      is_active: true,
    });

  if (officeError) {
    await supabase.from("organizations").delete().eq("id", orgData.id);
    return { data: null, error: "Ошибка создания главного офиса" };
  }

  return { data: orgData as Organization, error: null };
};

export const getOrganizationBySlug = async (slug: string): Promise<{
  data: OrganizationWithOffices | null;
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
    .select(`
      *,
      office_points (*)
    `)
    .eq("slug", slug)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return { data: null, error: "Организация не найдена" };
  }

  return { data: data as OrganizationWithOffices, error: null };
};

export const createOfficePoint = async (
  organizationId: string,
  formData: FormData
): Promise<{ data: OfficePoint | null; error: string | null }> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Не авторизован" };
  }

  const input = {
    name: formData.get("name") as string,
    address: (formData.get("address") as string) || "",
  };

  const validation = createOfficePointSchema.safeParse(input);

  if (!validation.success) {
    return { data: null, error: validation.error.issues[0]?.message || "Ошибка валидации" };
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", organizationId)
    .eq("user_id", user.id)
    .single();

  if (!org) {
    return { data: null, error: "Организация не найдена" };
  }

  const qrToken = generateQrToken();

  const { data, error } = await supabase
    .from("office_points")
    .insert({
      organization_id: organizationId,
      name: input.name,
      address: input.address || null,
      qr_token: qrToken,
      is_main: false,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: "Ошибка создания офисной точки" };
  }

  return { data: data as OfficePoint, error: null };
};

export const deleteOfficePoint = async (
  officePointId: string
): Promise<{ success: boolean; error: string | null }> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Не авторизован" };
  }

  const { data: officePoint } = await supabase
    .from("office_points")
    .select("id, is_main, organization_id, organizations!inner(user_id)")
    .eq("id", officePointId)
    .single();

  if (!officePoint) {
    return { success: false, error: "Точка не найдена" };
  }

  if (officePoint.is_main) {
    return { success: false, error: "Нельзя удалить главный офис" };
  }

  const { error } = await supabase
    .from("office_points")
    .delete()
    .eq("id", officePointId);

  if (error) {
    return { success: false, error: "Ошибка удаления" };
  }

  return { success: true, error: null };
};

export const regenerateOfficePointQR = async (
  officePointId: string
): Promise<{ data: OfficePoint | null; error: string | null }> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Не авторизован" };
  }

  const newToken = generateQrToken();

  const { data, error } = await supabase
    .from("office_points")
    .update({ qr_token: newToken })
    .eq("id", officePointId)
    .select()
    .single();

  if (error) {
    return { data: null, error: "Ошибка обновления QR-кода" };
  }

  return { data: data as OfficePoint, error: null };
};

export const createRegistrationQR = async (
  organizationId: string,
  expiresInHours: number
): Promise<{ data: RegistrationQR | null; error: string | null }> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Не авторизован" };
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", organizationId)
    .eq("user_id", user.id)
    .single();

  if (!org) {
    return { data: null, error: "Организация не найдена" };
  }

  const token = generateQrToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  const { data, error } = await supabase
    .from("registration_qr_codes")
    .insert({
      organization_id: organizationId,
      token,
      expires_at: expiresAt.toISOString(),
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: "Ошибка создания QR-кода регистрации" };
  }

  return { data: data as RegistrationQR, error: null };
};

export const getRegistrationQRCodes = async (
  organizationId: string
): Promise<{ data: RegistrationQR[]; error: string | null }> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], error: "Не авторизован" };
  }

  const { data, error } = await supabase
    .from("registration_qr_codes")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: "Ошибка загрузки" };
  }

  return { data: data as RegistrationQR[], error: null };
};

export const deactivateRegistrationQR = async (
  qrId: string
): Promise<{ success: boolean; error: string | null }> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Не авторизован" };
  }

  const { error } = await supabase
    .from("registration_qr_codes")
    .update({ is_active: false })
    .eq("id", qrId);

  if (error) {
    return { success: false, error: "Ошибка деактивации" };
  }

  return { success: true, error: null };
};

export const updateOrganizationSettings = async (
  organizationId: string,
  settings: OrganizationSettings
): Promise<{ success: boolean; error: string | null }> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Не авторизован" };
  }

  const validation = updateOrganizationSettingsSchema.safeParse(settings);

  if (!validation.success) {
    return { success: false, error: "Неверные настройки" };
  }

  const { error } = await supabase
    .from("organizations")
    .update({ settings, updated_at: new Date().toISOString() })
    .eq("id", organizationId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: "Ошибка сохранения настроек" };
  }

  return { success: true, error: null };
};
