import { Stack, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";

// Заготовка: главная модуля в кабинете.
const MenuHome = () => {
  const t = useTranslations("menu.home");

  return (
    <Stack gap="md">
      <Title order={1} size="h2">
        {t("title")}
      </Title>
      <Text c="dimmed">{t("placeholder")}</Text>
    </Stack>
  );
};

export default MenuHome;
