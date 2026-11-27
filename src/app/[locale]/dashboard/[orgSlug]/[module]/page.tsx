import { notFound } from "next/navigation";

import { moduleKeys, type ModuleKey } from "@/shared/config/site";
import ModuleGate from "@/widgets/ModuleGate";

type Props = { params: Promise<{ orgSlug: string; module: string }> };

const isModuleKey = (value: string): value is ModuleKey =>
  (moduleKeys as readonly string[]).includes(value);

const ModulePage = async ({ params }: Props) => {
  const { orgSlug, module } = await params;
  if (!isModuleKey(module)) notFound();
  return <ModuleGate slug={orgSlug} module={module} />;
};

export default ModulePage;
