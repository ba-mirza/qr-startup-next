import { Paper, Text, Title } from "@mantine/core";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CreateOrganizationForm } from "@/features/create-organization";
import { toLocale } from "@/i18n/locale";

import styles from "../layout.module.sass";

type Props = { params: Promise<{ locale: string }> };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale: toLocale((await params).locale), namespace: "onboarding" });
  return { title: t("title") };
};

// Организацию можно создать и при уже существующих: у владельца их может быть несколько.
const OnboardingPage = async ({ params }: Props) => {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "onboarding" });

  return (
    <Paper withBorder radius="lg" className={styles.auth__card}>
      <Title order={1} size="h2" mb={8}>
        {t("title")}
      </Title>
      <Text c="dimmed" size="sm" mb="lg">
        {t("subtitle")}
      </Text>
      <CreateOrganizationForm />
    </Paper>
  );
};

export default OnboardingPage;
