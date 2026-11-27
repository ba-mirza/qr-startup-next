import { notFound } from "next/navigation";

import { moduleApi, moduleQueryKeys } from "@/entities/module";
import { organizationApi, organizationQueryKeys } from "@/entities/organization";
import { moduleRegistry } from "@/modules";
import { createServerSupabase } from "@/shared/api/supabase/server";
import { isModuleKey } from "@/shared/config/module-keys";
import { getServerQueryClient } from "@/shared/lib/query-client";
import ModuleLocked from "@/widgets/ModuleLocked";

type Props = {
  params: Promise<{ orgSlug: string; module: string; path?: string[] }>;
};

// /dashboard/[orgSlug]/[module]/[segment]/...: страница модуля из реестра.
const ModulePage = async ({ params }: Props) => {
  const { orgSlug, module, path = [] } = await params;
  if (!isModuleKey(module)) notFound();

  // Тот же QueryClient, что в layout (cache() на запрос): данные уже загружены.
  const client = await createServerSupabase();
  const queryClient = getServerQueryClient();
  const organization = await queryClient.fetchQuery({
    queryKey: organizationQueryKeys.bySlug(orgSlug),
    queryFn: () => organizationApi.getBySlug(client, orgSlug),
  });
  if (!organization) notFound();

  const modules = await queryClient.fetchQuery({
    queryKey: moduleQueryKeys.forOrganization(organization.id),
    queryFn: () => moduleApi.listForOrganization(client, organization.id),
  });

  if (!modules.find((item) => item.key === module)?.isActive) {
    return <ModuleLocked slug={orgSlug} module={module} reason="locked" />;
  }

  const definition = moduleRegistry[module];
  if (!definition) return <ModuleLocked slug={orgSlug} module={module} reason="notImplemented" />;

  const [segment = "home", ...rest] = path;
  const Page = definition.pages[segment];
  if (!Page) notFound();

  return (
    <Page
      organization={{ id: organization.id, slug: organization.slug, name: organization.name }}
      rest={rest}
    />
  );
};

export default ModulePage;
