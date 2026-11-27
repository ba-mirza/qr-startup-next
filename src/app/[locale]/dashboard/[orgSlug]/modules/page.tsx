import { ModuleCatalog } from "@/features/connect-module";

type Props = { params: Promise<{ orgSlug: string }> };

const ModulesPage = async ({ params }: Props) => <ModuleCatalog slug={(await params).orgSlug} />;

export default ModulesPage;
