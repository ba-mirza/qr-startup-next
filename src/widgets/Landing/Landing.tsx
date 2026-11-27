import { Container, Group, Stack, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";

import LinkButton from "@/shared/ui/LinkButton";

import styles from "./Landing.module.sass";

const Landing = () => {
  const t = useTranslations("landing");

  return (
    <Container size="md" className={styles.landing}>
      <Stack align="center" gap="lg" className={styles.landing__hero}>
        <Text className={styles.landing__tagline}>{t("tagline")}</Text>
        <Title order={1} className={styles.landing__title}>
          {t("title")}
        </Title>
        <Text size="lg" c="dimmed" className={styles.landing__subtitle}>
          {t("subtitle")}
        </Text>
        <Group>
          <LinkButton href="/register" size="lg">
            {t("register")}
          </LinkButton>
          <LinkButton href="/login" size="lg" variant="default">
            {t("login")}
          </LinkButton>
        </Group>
      </Stack>
    </Container>
  );
};

export default Landing;
