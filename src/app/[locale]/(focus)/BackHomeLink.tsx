import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

import styles from "./layout.module.sass";

const BackHomeLink = () => {
  const t = useTranslations("auth");
  return (
    <Link href="/" className={styles.auth__back}>
      <ArrowLeft size={14} />
      {t("backHome")}
    </Link>
  );
};

export default BackHomeLink;
