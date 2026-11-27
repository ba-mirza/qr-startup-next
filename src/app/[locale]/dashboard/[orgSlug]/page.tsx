import DashboardOverview from "@/widgets/DashboardOverview";

type Props = { params: Promise<{ orgSlug: string }> };

const OverviewPage = async ({ params }: Props) => (
  <DashboardOverview slug={(await params).orgSlug} />
);

export default OverviewPage;
