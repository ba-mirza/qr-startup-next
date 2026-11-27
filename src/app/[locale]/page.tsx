import { setRequestLocale } from "next-intl/server";

import { toLocale } from "@/i18n/locale";
import Landing from "@/widgets/Landing";
import SiteFooter from "@/widgets/SiteFooter";
import SiteHeader from "@/widgets/SiteHeader";

const HomePage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  setRequestLocale(toLocale((await params).locale));

  return (
    <>
      <SiteHeader />
      <main>
        <Landing />
      </main>
      <SiteFooter />
    </>
  );
};

export default HomePage;
