"use client";

import { Badge, Button, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslations } from "next-intl";

import {
  StartTrialError,
  useOrganizationModulesQuery,
  useStartTrialMutation,
  type ModuleState,
} from "@/entities/module";
import { useOrganizationQuery } from "@/entities/organization";
import { useFormatDate } from "@/shared/lib/format";
import LinkButton from "@/shared/ui/LinkButton";
import ModuleIcon from "@/shared/ui/ModuleIcon";

import styles from "./ModuleCatalog.module.sass";

const ModuleCatalog = ({ slug }: { slug: string }) => {
  const t = useTranslations("dashboard.catalog");
  const tModules = useTranslations("landing.modules");
  const formatDate = useFormatDate();
  const { data: organization } = useOrganizationQuery(slug);
  const organizationId = organization?.id ?? "";
  const { data: modules = [] } = useOrganizationModulesQuery(organizationId);
  const startTrial = useStartTrialMutation(organizationId);

  const handleTrial = (module: ModuleState) =>
    startTrial.mutate(module.key, {
      onSuccess: () => notifications.show({ color: "green", message: t("trialStarted") }),
      onError: (error) =>
        notifications.show({
          color: "red",
          message: t(`errors.${error instanceof StartTrialError ? error.key : "unknown"}`),
        }),
    });

  const renderStatus = (module: ModuleState) => {
    if (module.isActive) {
      return (
        <Badge variant="filled">
          {module.activeUntil
            ? t("activeUntil", { date: formatDate(module.activeUntil) })
            : t("active")}
        </Badge>
      );
    }
    if (!module.isAvailable) return <Badge variant="outline" color="gray">{t("soon")}</Badge>;
    if (module.trialDays > 0 && !module.trialUsed) {
      return <Badge variant="light">{t("trialDays", { days: module.trialDays })}</Badge>;
    }
    return null;
  };

  const renderAction = (module: ModuleState) => {
    if (module.isActive) {
      return (
        <LinkButton href={`/dashboard/${slug}/${module.key}`} variant="light" fullWidth>
          {t("open")}
        </LinkButton>
      );
    }
    if (module.canStartTrial) {
      return (
        <Button
          fullWidth
          loading={startTrial.isPending && startTrial.variables === module.key}
          onClick={() => handleTrial(module)}
        >
          {t("startTrial")}
        </Button>
      );
    }
    return (
      <Button fullWidth variant="default" disabled>
        {module.isAvailable ? t("paymentSoon") : t("soon")}
      </Button>
    );
  };

  return (
    <Stack gap="lg" maw={1080}>
      <div>
        <Title order={1} size="h2" mb={4}>
          {t("title")}
        </Title>
        <Text c="dimmed">{t("subtitle")}</Text>
      </div>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        {modules.map((module) => (
          <Card key={module.key} withBorder radius="lg" padding="lg" className={styles.card}>
            <Group justify="space-between" mb="md">
              <span className={styles.card__icon}>
                <ModuleIcon module={module.key} size={22} />
              </span>
              {renderStatus(module)}
            </Group>
            <Text fw={600} size="lg" mb={4}>
              {tModules(`${module.key}.title`)}
            </Text>
            <Text c="dimmed" size="sm" className={styles.card__description}>
              {tModules(`${module.key}.description`)}
            </Text>
            {module.trialUsed && !module.isActive && (
              <Text size="xs" c="dimmed" mb="xs">
                {t("trialUsed")}
              </Text>
            )}
            {renderAction(module)}
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
};

export default ModuleCatalog;
