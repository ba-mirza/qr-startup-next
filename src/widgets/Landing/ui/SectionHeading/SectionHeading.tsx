import { Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

import styles from "./SectionHeading.module.sass";

type Props = { title: ReactNode; subtitle?: ReactNode };

const SectionHeading = ({ title, subtitle }: Props) => (
  <div className={styles.heading}>
    <Title order={2} className={styles.heading__title}>
      {title}
    </Title>
    {subtitle && (
      <Text size="lg" c="dimmed" className={styles.heading__subtitle}>
        {subtitle}
      </Text>
    )}
  </div>
);

export default SectionHeading;
