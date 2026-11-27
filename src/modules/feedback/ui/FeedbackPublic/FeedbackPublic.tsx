import { Container, Stack, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";

// Заготовка: гостевая страница по QR. Данные — через RPC модуля по props.token.
const FeedbackPublic = () => {
  const t = useTranslations("feedback.public");

  return (
    <Container size="xs" py="xl">
      <Stack gap="md">
        <Title order={1} size="h2">
          {t("title")}
        </Title>
        <Text c="dimmed">{t("placeholder")}</Text>
      </Stack>
    </Container>
  );
};

export default FeedbackPublic;
