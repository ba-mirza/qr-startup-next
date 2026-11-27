import { setRequestLocale } from "next-intl/server";

import { toLocale } from "@/i18n/locale";
import Landing from "@/widgets/Landing";

const HomePage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  setRequestLocale(toLocale((await params).locale));
  return <Landing />;
};

export default HomePage;
