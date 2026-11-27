import { organizationApi } from "@/entities/organization";
import { redirect } from "@/i18n/navigation";
import { toLocale } from "@/i18n/locale";
import { createServerSupabase } from "@/shared/api/supabase/server";

type Props = { params: Promise<{ locale: string }> };

// /dashboard ведёт в первую организацию пользователя или в онбординг.
const DashboardIndexPage = async ({ params }: Props) => {
  const locale = toLocale((await params).locale);
  const memberships = await organizationApi.listMine(await createServerSupabase());
  const first = memberships[0];

  return redirect({
    href: first ? `/dashboard/${first.organization.slug}` : "/onboarding",
    locale,
  });
};

export default DashboardIndexPage;
