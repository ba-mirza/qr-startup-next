import { Container, SimpleGrid, Text } from "@mantine/core";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { landingSections, type LandingSection } from "@/shared/config/site";
import Logo from "@/shared/ui/Logo";

import styles from "./SiteFooter.module.sass";

const NAV: LandingSection[] = ["modules", "how", "pricing", "about"];

const SiteFooter = () => {
  const t = useTranslations("footer");
  const tNav = useTranslations("header.nav");
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container size="lg">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={40}>
          <div>
            <Link href="/" aria-label="KasipQR">
              <Logo inverted />
            </Link>
            <Text size="sm" className={styles.footer__description}>
              {t("description")}
            </Text>
            <Text size="sm" className={styles.footer__muted}>
              {t("location")}
            </Text>
          </div>
          <div>
            <Text fw={600} className={styles.footer__heading}>
              {t("product")}
            </Text>
            <ul className={styles.footer__list}>
              {NAV.map((key) => (
                <li key={key}>
                  <a href={`/#${landingSections[key]}`} className={styles.footer__link}>
                    {tNav(key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </SimpleGrid>
        <div className={styles.footer__bottom}>
          <Text size="sm" className={styles.footer__muted}>
            © {year} KasipQR by today.development. {t("rights")}
          </Text>
        </div>
      </Container>
    </footer>
  );
};

export default SiteFooter;
