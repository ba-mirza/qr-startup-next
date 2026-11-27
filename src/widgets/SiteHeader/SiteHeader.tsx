"use client";

import { Burger, Container, Divider, Drawer, Stack } from "@mantine/core";
import { useDisclosure, useWindowScroll } from "@mantine/hooks";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { landingSections, type LandingSection } from "@/shared/config/site";
import { cn } from "@/shared/lib/cn";
import Logo from "@/shared/ui/Logo";

import AuthActions from "./ui/AuthActions";
import LanguageSwitcher from "./ui/LanguageSwitcher";
import styles from "./SiteHeader.module.sass";

const NAV: LandingSection[] = ["modules", "how", "pricing", "about"];

const SiteHeader = () => {
  const t = useTranslations("header");
  const [{ y }] = useWindowScroll();
  const [opened, { toggle, close }] = useDisclosure(false);

  const links = NAV.map((key) => (
    <a
      key={key}
      href={`/#${landingSections[key]}`}
      className={styles.header__link}
      onClick={close}
    >
      {t(`nav.${key}`)}
    </a>
  ));

  return (
    <header className={cn(styles.header, y > 20 && styles["header--scrolled"])}>
      <Container size="lg" className={styles.header__inner}>
        <Link href="/" aria-label="KasipQR">
          <Logo />
        </Link>

        <nav className={styles.header__nav}>{links}</nav>

        <div className={styles.header__actions}>
          <LanguageSwitcher />
          <div className={styles.header__auth}>
            <AuthActions />
          </div>
          <Burger
            opened={opened}
            onClick={toggle}
            size="sm"
            className={styles.header__burger}
            aria-label={t("openMenu")}
          />
        </div>
      </Container>

      <Drawer
        opened={opened}
        onClose={close}
        position="top"
        size="auto"
        title={<Logo />}
        hiddenFrom="md"
      >
        <Stack gap={4}>{links}</Stack>
        <Divider my="md" />
        <AuthActions stacked onNavigate={close} />
      </Drawer>
    </header>
  );
};

export default SiteHeader;
