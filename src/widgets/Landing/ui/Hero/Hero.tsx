import { Container, Group, Text, Title } from "@mantine/core";
import { ArrowRight, CheckCircle2, QrCode } from "lucide-react";
import { useTranslations } from "next-intl";

import LinkButton from "@/shared/ui/LinkButton";

import styles from "./Hero.module.sass";

const POINTS = ["anyBusiness", "trial", "noHardware"] as const;
const PREVIEW_MODULES = ["attendance", "feedback", "menu", "bonus"] as const;

const Hero = () => {
  const t = useTranslations("landing.hero");
  const tModules = useTranslations("landing.modules");

  return (
    <section className={styles.hero}>
      <Container size="md" className={styles.hero__content}>
        <span className={styles.hero__badge}>
          <QrCode size={16} />
          {t("badge")}
        </span>

        <Title order={1} className={styles.hero__title}>
          {t("titleStart")} <span className={styles.hero__accent}>{t("titleAccent")}</span>
        </Title>

        <Text className={styles.hero__subtitle}>{t("subtitle")}</Text>

        <Group justify="center" gap="sm" className={styles.hero__cta}>
          <LinkButton href="/register" size="lg" rightSection={<ArrowRight size={18} />}>
            {t("register")}
          </LinkButton>
          <LinkButton href="/login" size="lg" variant="default">
            {t("login")}
          </LinkButton>
        </Group>

        <ul className={styles.hero__points}>
          {POINTS.map((key) => (
            <li key={key} className={styles.hero__point}>
              <CheckCircle2 size={18} className={styles.hero__check} />
              {t(`points.${key}`)}
            </li>
          ))}
        </ul>
      </Container>

      <Container size="lg">
        <div className={styles.hero__preview} aria-hidden>
          <div className={styles.hero__window}>
            <div className={styles.hero__sidebar}>
              {PREVIEW_MODULES.map((key, index) => (
                <span
                  key={key}
                  className={index === 0 ? styles["hero__nav-item--active"] : styles["hero__nav-item"]}
                >
                  {tModules(`${key}.title`)}
                </span>
              ))}
            </div>
            <div className={styles.hero__main}>
              <div className={styles.hero__stats}>
                {[0, 1, 2].map((item) => (
                  <span key={item} className={styles.hero__stat} />
                ))}
              </div>
              {[0, 1, 2, 3].map((item) => (
                <span key={item} className={styles.hero__row} />
              ))}
            </div>
            <div className={styles.hero__qr}>
              <QrCode size={72} strokeWidth={1.25} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
