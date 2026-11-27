import { Badge, Container, SimpleGrid, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";

import { availableModules, landingSections, moduleKeys } from "@/shared/config/site";
import ModuleIcon from "@/shared/ui/ModuleIcon";

import SectionHeading from "../SectionHeading";
import styles from "./Modules.module.sass";

const Modules = () => {
  const t = useTranslations("landing.modules");

  return (
    <section id={landingSections.modules} className={styles.modules}>
      <Container size="lg">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          {moduleKeys.map((key) => {
            const available = availableModules.includes(key);
            return (
              <article key={key} className={styles.modules__card}>
                <div className={styles.modules__top}>
                  <span className={styles.modules__icon}>
                    <ModuleIcon module={key} size={24} />
                  </span>
                  <Badge variant={available ? "light" : "outline"} color={available ? "brand" : "gray"}>
                    {available ? t("available") : t("soon")}
                  </Badge>
                </div>
                <Title order={3} className={styles.modules__title}>
                  {t(`${key}.title`)}
                </Title>
                <Text c="dimmed">{t(`${key}.description`)}</Text>
              </article>
            );
          })}
        </SimpleGrid>
      </Container>
    </section>
  );
};

export default Modules;
