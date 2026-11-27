import { QrCode } from "lucide-react";

import { cn } from "@/shared/lib/cn";

import styles from "./Logo.module.sass";

type Props = { inverted?: boolean; className?: string };

const Logo = ({ inverted = false, className }: Props) => (
  <span className={cn(styles.logo, inverted && styles["logo--inverted"], className)}>
    <span className={styles.logo__mark}>
      <QrCode size={18} strokeWidth={2.25} />
    </span>
    <span className={styles.logo__text}>KasipQR</span>
  </span>
);

export default Logo;
