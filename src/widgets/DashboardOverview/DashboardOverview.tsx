"use client";

import { Badge, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";

import { useOrganizationModulesQuery } from "@/entities/module";
import { useOrganizationQuery } from "@/entities/organization";
import { Link } from "@/i18n/navigation";
import { useFormatDate } from "@/shared/lib/format";
import LinkButton from "@/shared/ui/LinkButton";
import ModuleIcon from "@/shared/ui/ModuleIcon";

const DashboardOverview = ({ slug }: { slug: string }) => {
  const t = useTranslations("dashboard.overview");
  const tModules = useTranslations("landing.modules");
  const formatDate = useFormatDate();
  const { data: organization } = useOrganizationQuery(slug);
  const { data: modules = [] } = useOrganizationModulesQuery(organization?.id ?? "");
  const active = modules.filter((module) => module.isActive);

  return (
    <Stack gap="lg" maw={960}>
      <Title order={1} size="h2">
        {t("welcome", { name: organization?.name ?? "" })}
      </Title>

      {active.length === 0 ? (
        <Card withBorder radius="lg" padding="xl">
          <Stack align="flex-start" gap="md">
            <Text>{t("noModules")}</Text>
            <LinkButton href={`/dashboard/${slug}/modules`}>{t("toCatalog")}</LinkButton>
          </Stack>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {active.map((module) => (
            <Card
              key={module.key}
              withBorder
              radius="lg"
              padding="lg"
              component={Link}
              href={`/dashboard/${slug}/${module.key}`}
            >
              <Group justify="space-between" mb="sm">
                <ModuleIcon module={module.key} size={22} color="var(--mantine-color-brand-6)" />
                <Badge variant="light">
                  {module.activeUntil
                    ? t("activeUntil", { date: formatDate(module.activeUntil) })
                    : t("activeForever")}
                </Badge>
              </Group>
              <Text fw={600}>{tModules(`${module.key}.title`)}</Text>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
};

export default DashboardOverview;
