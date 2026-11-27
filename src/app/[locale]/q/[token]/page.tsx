import { Container, Stack, Text, Title } from "@mantine/core";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { qrApi } from "@/entities/qr";
import { toLocale } from "@/i18n/locale";
import { moduleRegistry } from "@/modules";
import { createServerSupabase } from "@/shared/api/supabase/server";

type Props = { params: Promise<{ locale: string; token: string }> };

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Единая точка входа по QR: resolve_qr() определяет модуль, страницу отдаёт модуль.
const PublicQrPage = async ({ params }: Props) => {
  const { locale: rawLocale, token } = await params;
  const locale = toLocale(rawLocale);
  setRequestLocale(locale);

  const resolved = await qrApi.resolve(await createServerSupabase(), token);
  const PublicPage = resolved ? moduleRegistry[resolved.module]?.publicPage : undefined;

  if (!resolved || !PublicPage) {
    const t = await getTranslations({ locale, namespace: "publicQr" });
    return (
      <Container size="xs" py="xl">
        <Stack gap="sm">
          <Title order={1} size="h3">
            {t("notFoundTitle")}
          </Title>
          <Text c="dimmed">{t("notFoundText")}</Text>
        </Stack>
      </Container>
    );
  }

  return <PublicPage token={token} purpose={resolved.purpose} />;
};

export default PublicQrPage;
