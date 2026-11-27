"use client";

import { Card, Stack, Text, Title } from "@mantine/core";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";

import { useOrganizationModulesQuery } from "@/entities/module";
import { useOrganizationQuery } from "@/entities/organization";
import type { ModuleKey } from "@/shared/config/site";
import LinkButton from "@/shared/ui/LinkButton";

type Props = { slug: string; module: ModuleKey };

// Экран модуля: без активной подписки — заглушка «Подключить», данные модуля не грузятся.
// Это UX, а не защита: доступ к данным модуля ограничивает RLS через has_module().
const ModuleGate = ({ slug, module }: Props) => {
  const t = useTranslations("dashboard.module");
  const tModules = useTranslations("landing.modules");
  const { data: organization } = useOrganizationQuery(slug);
  const { data: modules } = useOrganizationModulesQuery(organization?.id ?? "");
  const state = modules?.find((item) => item.key === module);
  const name = tModules(`${module}.title`);

  if (!state?.isActive) {
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
  }

  return (
    <Stack gap="md">
      <Title order={1} size="h2">
        {name}
      </Title>
      <Text c="dimmed">{t("inProgress")}</Text>
    </Stack>
  );
};

export default ModuleGate;
