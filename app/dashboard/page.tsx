import { redirect } from "next/navigation";
import { getUserOrganization } from "./actions";

const DashboardPage = async () => {
  const { data: organization } = await getUserOrganization();

  if (organization) {
    redirect(`/dashboard/${organization.slug}`);
  }

  redirect("/dashboard/new");
};

export default DashboardPage;
