"use client";

import { Button, Card, Stack, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";

type Props = { reset: () => void };

const DashboardError = ({ reset }: Props) => {
  const t = useTranslations("dashboard.error");

  return (
    <Card withBorder radius="lg" padding="xl" maw={560} m="lg">
      <Stack align="flex-start" gap="md">
        <Title order={1} size="h3">
          {t("title")}
        </Title>
        <Text c="dimmed">{t("text")}</Text>
        <Button onClick={reset}>{t("retry")}</Button>
      </Stack>
    </Card>
  );
};

export default DashboardError;
