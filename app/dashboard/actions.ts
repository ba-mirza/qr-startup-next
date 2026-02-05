"use server";

import { createClient } from "@/lib/supabase/server";
import { createOrganizationSchema } from "@/lib/validations/organization";
import { createOfficePointSchema, updateOrganizationSettingsSchema } from "@/lib/validations/office-point";
import type { Organization, OrganizationWithOffices, OfficePoint, OrganizationSettings } from "@/types/organization";
import type { RegistrationQR } from "@/types/registration-qr";
import type { CheckLogWithRelations } from "@/types/check-log";
import type { Employee, EmployeeStatus } from "@/types/employee";

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

export const getCheckLogs = async (
  organizationId: string,
  options?: {
    date?: string;
    employeeId?: string;
    officePointId?: string;
    checkType?: "check_in" | "check_out";
    limit?: number;
    offset?: number;
  }
): Promise<{ data: CheckLogWithRelations[]; total: number; error: string | null }> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], total: 0, error: "Не авторизован" };
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", organizationId)
    .eq("user_id", user.id)
    .single();

  if (!org) {
    return { data: [], total: 0, error: "Организация не найдена" };
  }

  let query = supabase
    .from("check_logs")
    .select(`
      *,
      employee:employees!inner(id, full_name, position, organization_id),
      office_point:office_points!inner(id, name, organization_id)
    `, { count: "exact" })
    .eq("employee.organization_id", organizationId)
    .order("checked_at", { ascending: false });

  if (options?.date) {
    const startOfDay = `${options.date}T00:00:00`;
    const endOfDay = `${options.date}T23:59:59`;
    query = query.gte("checked_at", startOfDay).lte("checked_at", endOfDay);
  }

  if (options?.employeeId) {
    query = query.eq("employee_id", options.employeeId);
  }

  if (options?.officePointId) {
    query = query.eq("office_point_id", options.officePointId);
  }

  if (options?.checkType) {
    query = query.eq("check_type", options.checkType);
  }

  const limit = options?.limit || 50;
  const offset = options?.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return { data: [], total: 0, error: "Ошибка загрузки логов" };
  }

  return {
    data: data as CheckLogWithRelations[],
    total: count || 0,
    error: null,
  };
};

export const getTodayStats = async (
  organizationId: string
): Promise<{
  data: {
    totalCheckIns: number;
    totalCheckOuts: number;
    uniqueEmployees: number;
  } | null;
  error: string | null;
}> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Не авторизован" };
  }

  const today = new Date().toISOString().split("T")[0];
  const startOfDay = `${today}T00:00:00`;
  const endOfDay = `${today}T23:59:59`;

  const { data: logs, error } = await supabase
    .from("check_logs")
    .select(`
      check_type,
      employee_id,
      employee:employees!inner(organization_id)
    `)
    .eq("employee.organization_id", organizationId)
    .gte("checked_at", startOfDay)
    .lte("checked_at", endOfDay);

  if (error) {
    return { data: null, error: "Ошибка загрузки статистики" };
  }

  const totalCheckIns = logs.filter((l) => l.check_type === "check_in").length;
  const totalCheckOuts = logs.filter((l) => l.check_type === "check_out").length;
  const uniqueEmployees = new Set(logs.map((l) => l.employee_id)).size;

  return {
    data: { totalCheckIns, totalCheckOuts, uniqueEmployees },
    error: null,
  };
};

// Employee actions

export const getEmployees = async (
  organizationId: string,
  status?: EmployeeStatus
): Promise<{ data: Employee[]; error: string | null }> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], error: "Не авторизован" };
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", organizationId)
    .eq("user_id", user.id)
    .single();

  if (!org) {
    return { data: [], error: "Организация не найдена" };
  }

  let query = supabase
    .from("employees")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error: "Ошибка загрузки сотрудников" };
  }

  return { data: data as Employee[], error: null };
};

export const approveEmployee = async (
  employeeId: string
): Promise<{ success: boolean; error: string | null }> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Не авторизован" };
  }

  const { data: employee } = await supabase
    .from("employees")
    .select("id, organization_id, organizations!inner(user_id)")
    .eq("id", employeeId)
    .single();

  if (!employee) {
    return { success: false, error: "Сотрудник не найден" };
  }

  const { error } = await supabase
    .from("employees")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("id", employeeId);

  if (error) {
    return { success: false, error: "Ошибка одобрения" };
  }

  return { success: true, error: null };
};

export const rejectEmployee = async (
  employeeId: string
): Promise<{ success: boolean; error: string | null }> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Не авторизован" };
  }

  const { data: employee } = await supabase
    .from("employees")
    .select("id, organization_id, organizations!inner(user_id)")
    .eq("id", employeeId)
    .single();

  if (!employee) {
    return { success: false, error: "Сотрудник не найден" };
  }

  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("id", employeeId);

  if (error) {
    return { success: false, error: "Ошибка отклонения" };
  }

  return { success: true, error: null };
};

export const updateEmployeeStatus = async (
  employeeId: string,
  status: EmployeeStatus
): Promise<{ success: boolean; error: string | null }> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Не авторизован" };
  }

  const { error } = await supabase
    .from("employees")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", employeeId);

  if (error) {
    return { success: false, error: "Ошибка обновления статуса" };
  }

  return { success: true, error: null };
};

export const updateEmployee = async (
  employeeId: string,
  data: { full_name?: string; position?: string; phone?: string; email?: string }
): Promise<{ data: Employee | null; error: string | null }> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Не авторизован" };
  }

  const { data: updated, error } = await supabase
    .from("employees")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", employeeId)
    .select()
    .single();

  if (error) {
    return { data: null, error: "Ошибка обновления" };
  }

  return { data: updated as Employee, error: null };
};

export const getEmployeesCount = async (
  organizationId: string
): Promise<{ total: number; pending: number; active: number; error: string | null }> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { total: 0, pending: 0, active: 0, error: "Не авторизован" };
  }

  const { data, error } = await supabase
    .from("employees")
    .select("status")
    .eq("organization_id", organizationId);

  if (error) {
    return { total: 0, pending: 0, active: 0, error: "Ошибка загрузки" };
  }

  const total = data.length;
  const pending = data.filter((e) => e.status === "pending").length;
  const active = data.filter((e) => e.status === "active").length;

  return { total, pending, active, error: null };
};
