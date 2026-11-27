import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LoginForm } from "@/features/auth";
import { toLocale } from "@/i18n/locale";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale: toLocale((await params).locale), namespace: "auth" });
  return { title: t("login.title") };
};

const LoginPage = async ({ params, searchParams }: Props) => {
  setRequestLocale(toLocale((await params).locale));
  const { error } = await searchParams;
  return <LoginForm callbackError={error === "callback"} />;
};

export default LoginPage;
