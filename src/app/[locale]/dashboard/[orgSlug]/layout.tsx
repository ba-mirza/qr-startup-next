import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { moduleApi, moduleQueryKeys } from "@/entities/module";
import { organizationApi, organizationQueryKeys } from "@/entities/organization";
import { toLocale } from "@/i18n/locale";
import { moduleRegistry } from "@/modules";
import { createServerSupabase } from "@/shared/api/supabase/server";
import type { ModuleKey } from "@/shared/config/site";
import { getServerQueryClient } from "@/shared/lib/query-client";
import DashboardShell, { type ModuleNav } from "@/widgets/DashboardShell";

// Подпункты модулей для бокового меню: сегменты из реестра, подписи из <module>.nav.
const buildModuleNav = async (): Promise<ModuleNav> => {
  const messages: Partial<Record<ModuleKey, { nav?: Record<string, string> }>> =
    await getMessages();
  const nav: ModuleNav = {};
  for (const definition of Object.values(moduleRegistry)) {
    const labels = messages[definition.key]?.nav ?? {};
    nav[definition.key] = definition.nav.map((segment) => ({
      segment,
      label: labels[segment] ?? segment,
    }));
  }
  return nav;
};

type Props = { children: ReactNode; params: Promise<{ locale: string; orgSlug: string }> };

const OrganizationLayout = async ({ children, params }: Props) => {
  const { locale, orgSlug } = await params;
  setRequestLocale(toLocale(locale));

  const client = await createServerSupabase();
  const queryClient = getServerQueryClient();

  // RLS отдаёт организацию только её участникам: чужой slug → 404.
  const organization = await queryClient.fetchQuery({
    queryKey: organizationQueryKeys.bySlug(orgSlug),
    queryFn: () => organizationApi.getBySlug(client, orgSlug),
  });
  if (!organization) notFound();

  await queryClient.prefetchQuery({
    queryKey: moduleQueryKeys.forOrganization(organization.id),
    queryFn: () => moduleApi.listForOrganization(client, organization.id),
  });

  const {
    data: { user },
  } = await client.auth.getUser();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardShell slug={orgSlug} email={user?.email ?? null} moduleNav={await buildModuleNav()}>
        {children}
      </DashboardShell>
    </HydrationBoundary>
  );
};

export default OrganizationLayout;
