import { Container, SimpleGrid, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";

import { landingSections } from "@/shared/config/site";

import SectionHeading from "../SectionHeading";
import styles from "./HowItWorks.module.sass";

const STEPS = ["register", "module", "print", "work"] as const;

const HowItWorks = () => {
  const t = useTranslations("landing.how");

  return (
    <section id={landingSections.how} className={styles.how}>
      <Container size="lg">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
          {STEPS.map((key, index) => (
            <div key={key} className={styles.how__step}>
              <span className={styles.how__number}>{index + 1}</span>
              <Title order={3} className={styles.how__title}>
                {t(`steps.${key}.title`)}
              </Title>
              <Text c="dimmed" size="sm">
                {t(`steps.${key}.description`)}
              </Text>
            </div>
          ))}
        </SimpleGrid>
      </Container>
    </section>
  );
};

export default HowItWorks;
