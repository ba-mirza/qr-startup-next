"use client";

import { AppShell, Badge, Burger, Group, NavLink, ScrollArea, Text, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { LayoutDashboard, Lock, LogOut, Puzzle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { useOrganizationModulesQuery } from "@/entities/module";
import { useOrganizationQuery } from "@/entities/organization";
import { useSignOutMutation } from "@/features/auth";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import Logo from "@/shared/ui/Logo";
import ModuleIcon from "@/shared/ui/ModuleIcon";

import styles from "./DashboardShell.module.sass";

type Props = { slug: string; email: string | null; children: ReactNode };

const DashboardShell = ({ slug, email, children }: Props) => {
  const t = useTranslations("dashboard.nav");
  const tModules = useTranslations("landing.modules");
  const pathname = usePathname();
  const router = useRouter();
  const [opened, { toggle, close }] = useDisclosure(false);
  const signOut = useSignOutMutation();

  const { data: organization } = useOrganizationQuery(slug);
  const { data: modules = [] } = useOrganizationModulesQuery(organization?.id ?? "");

  const base = `/dashboard/${slug}`;
  const isActive = (href: string) => pathname === href;

  const handleSignOut = () =>
    signOut.mutate(undefined, {
      onSuccess: () => {
        router.replace("/login");
        router.refresh();
      },
    });

  return (
    <AppShell
      header={{ height: { base: 56, md: 0 } }}
      navbar={{ width: 264, breakpoint: "md", collapsed: { mobile: !opened } }}
      padding="lg"
      className={styles.shell}
    >
      <AppShell.Header hiddenFrom="md" className={styles.shell__header}>
        <Group h="100%" px="md" justify="space-between">
          <Logo />
          <Burger opened={opened} onClick={toggle} size="sm" aria-label={t("openMenu")} />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className={styles.shell__navbar}>
        <div className={styles.shell__brand}>
          <Logo />
          <Text fw={600} mt="md" truncate>
            {organization?.name}
          </Text>
        </div>

        <ScrollArea className={styles.shell__nav}>
          <Text className={styles.shell__section}>{t("core")}</Text>
          <NavLink
            component={Link}
            href={base}
            label={t("overview")}
            leftSection={<LayoutDashboard size={18} />}
            active={isActive(base)}
            onClick={close}
          />
          <NavLink
            component={Link}
            href={`${base}/modules`}
            label={t("catalog")}
            leftSection={<Puzzle size={18} />}
            active={isActive(`${base}/modules`)}
            onClick={close}
          />

          <Text className={styles.shell__section}>{t("modules")}</Text>
          {modules.map((module) => {
            const href = `${base}/${module.key}`;
            const right = module.isActive ? undefined : module.isAvailable ? (
              <Badge size="xs" variant="light">
                {t("connect")}
              </Badge>
            ) : (
              <Badge size="xs" variant="outline" color="gray">
                {t("soon")}
              </Badge>
            );

            return (
              <NavLink
                key={module.key}
                component={Link}
                href={href}
                label={tModules(`${module.key}.title`)}
                leftSection={
                  module.isActive ? <ModuleIcon module={module.key} size={18} /> : <Lock size={16} />
                }
                rightSection={right}
                active={pathname.startsWith(href)}
                className={module.isActive ? undefined : styles["shell__link--locked"]}
                onClick={close}
              />
            );
          })}
        </ScrollArea>

        <div className={styles.shell__footer}>
          <Text size="xs" c="dimmed" truncate>
            {email}
          </Text>
          <UnstyledButton className={styles.shell__signout} onClick={handleSignOut}>
            <LogOut size={16} />
            {t("signOut")}
          </UnstyledButton>
        </div>
      </AppShell.Navbar>

      <AppShell.Main className={styles.shell__main}>{children}</AppShell.Main>
    </AppShell>
  );
};

export default DashboardShell;
