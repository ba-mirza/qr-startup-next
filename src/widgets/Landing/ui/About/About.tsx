import { Container, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Lightbulb, Rocket, Target } from "lucide-react";
import { useTranslations } from "next-intl";

import { landingSections } from "@/shared/config/site";

import styles from "./About.module.sass";

const VALUES = [
  { key: "mission", Icon: Target },
  { key: "approach", Icon: Lightbulb },
  { key: "vision", Icon: Rocket },
] as const;

const About = () => {
  const t = useTranslations("landing.about");

  return (
    <section id={landingSections.about} className={styles.about}>
      <Container size="lg">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={48}>
          <div>
            <Title order={2} className={styles.about__title}>
              {t("title")} <span className={styles.about__accent}>KasipQR</span>
            </Title>
            <Text size="lg" className={styles.about__lead}>
              {t("lead")}
            </Text>
            <Text c="dimmed">{t("text")}</Text>
          </div>
          <Stack gap="md">
            {VALUES.map(({ key, Icon }) => (
              <div key={key} className={styles.about__value}>
                <span className={styles.about__icon}>
                  <Icon size={20} />
                </span>
                <div>
                  <Title order={3} className={styles["about__value-title"]}>
                    {t(`values.${key}.title`)}
                  </Title>
                  <Text size="sm" c="dimmed">
                    {t(`values.${key}.description`)}
                  </Text>
                </div>
              </div>
            ))}
          </Stack>
        </SimpleGrid>
      </Container>
    </section>
  );
};

export default About;
