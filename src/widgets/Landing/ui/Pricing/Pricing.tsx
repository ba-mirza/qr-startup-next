import { Badge, Container, SimpleGrid, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";

import { availableModules, landingSections, moduleKeys } from "@/shared/config/site";
import { cn } from "@/shared/lib/cn";
import LinkButton from "@/shared/ui/LinkButton";
import ModuleIcon from "@/shared/ui/ModuleIcon";

import SectionHeading from "../SectionHeading";
import styles from "./Pricing.module.sass";

// Цены модулей ещё не утверждены: показываем пробный период и статус.
const Pricing = () => {
  const t = useTranslations("landing.pricing");
  const tModules = useTranslations("landing.modules");

  return (
    <section id={landingSections.pricing} className={styles.pricing}>
      <Container size="lg">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
          {moduleKeys.map((key) => {
            const available = availableModules.includes(key);
            return (
              <article
                key={key}
                className={cn(styles.pricing__card, available && styles["pricing__card--featured"])}
              >
                <div className={styles.pricing__head}>
                  <ModuleIcon module={key} size={20} className={styles.pricing__icon} />
                  <Title order={3} className={styles.pricing__title}>
                    {tModules(`${key}.title`)}
                  </Title>
                </div>
                <Badge
                  size="lg"
                  variant={available ? "filled" : "light"}
                  color={available ? "brand" : "gray"}
                  className={styles.pricing__badge}
                >
                  {available ? t("trial") : t("soon")}
                </Badge>
                <Text size="sm" c="dimmed" className={styles.pricing__note}>
                  {available ? t("attendanceNote") : t("soonNote")}
                </Text>
                <LinkButton
                  href="/register"
                  fullWidth
                  variant={available ? "filled" : "default"}
                  disabled={!available}
                >
                  {available ? t("start") : t("notify")}
                </LinkButton>
              </article>
            );
          })}
        </SimpleGrid>
      </Container>
    </section>
  );
};

export default Pricing;
