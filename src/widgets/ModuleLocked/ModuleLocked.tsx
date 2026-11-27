import { Card, Stack, Text, Title } from "@mantine/core";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";

import type { ModuleKey } from "@/shared/config/site";
import LinkButton from "@/shared/ui/LinkButton";

type Props = { slug: string; module: ModuleKey; reason: "locked" | "notImplemented" };

// Экран вместо модуля: не подключён или ещё не готов. Это UX, а не защита —
// доступ к данным модуля ограничивает RLS через has_module().
const ModuleLocked = ({ slug, module, reason }: Props) => {
  const t = useTranslations("dashboard.module");
  const tModules = useTranslations("landing.modules");
  const name = tModules(`${module}.title`);

  if (reason === "notImplemented") {
    return (
      <Stack gap="md">
        <Title order={1} size="h2">
          {name}
        </Title>
        <Text c="dimmed">{t("notImplemented")}</Text>
      </Stack>
    );
  }

  return (
    <Card withBorder radius="lg" padding="xl" maw={560}>
      <Stack align="flex-start" gap="md">
        <Lock size={28} color="var(--mantine-color-gray-6)" />
        <Title order={1} size="h3">
          {t("lockedTitle", { name })}
        </Title>
        <Text c="dimmed">{t("lockedText")}</Text>
        <LinkButton href={`/dashboard/${slug}/modules`}>{t("toCatalog")}</LinkButton>
      </Stack>
    </Card>
  );
};

export default ModuleLocked;
