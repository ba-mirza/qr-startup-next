import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { RegisterForm } from "@/features/auth";
import { toLocale } from "@/i18n/locale";

type Props = { params: Promise<{ locale: string }> };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale: toLocale((await params).locale), namespace: "auth" });
  return { title: t("register.title") };
};

const RegisterPage = async ({ params }: Props) => {
  setRequestLocale(toLocale((await params).locale));
  return <RegisterForm />;
};

export default RegisterPage;
