import { Paper, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

import styles from "./AuthCard.module.sass";

type Props = { title: ReactNode; subtitle?: ReactNode; footer?: ReactNode; children: ReactNode };

const AuthCard = ({ title, subtitle, footer, children }: Props) => (
  <Paper className={styles.card} withBorder radius="lg">
    <Title order={1} className={styles.card__title}>
      {title}
    </Title>
    {subtitle && (
      <Text c="dimmed" size="sm" className={styles.card__subtitle}>
        {subtitle}
      </Text>
    )}
    {children}
    {footer && <div className={styles.card__footer}>{footer}</div>}
  </Paper>
);

export default AuthCard;
