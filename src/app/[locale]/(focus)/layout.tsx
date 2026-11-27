import { Container } from "@mantine/core";
import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import Logo from "@/shared/ui/Logo";

import BackHomeLink from "./BackHomeLink";
import styles from "./layout.module.sass";

const AuthLayout = ({ children }: { children: ReactNode }) => (
  <div className={styles.auth}>
    <Container size="xs" className={styles.auth__inner}>
      <Link href="/" aria-label="KasipQR">
        <Logo />
      </Link>
      {children}
      <BackHomeLink />
    </Container>
  </div>
);

export default AuthLayout;
