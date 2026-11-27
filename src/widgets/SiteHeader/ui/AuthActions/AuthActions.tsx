"use client";

import { Group, Skeleton, Stack } from "@mantine/core";
import { useTranslations } from "next-intl";

import { useSessionUser } from "@/entities/session";
import LinkButton from "@/shared/ui/LinkButton";

type Props = { stacked?: boolean; onNavigate?: () => void };

const AuthActions = ({ stacked = false, onNavigate }: Props) => {
  const t = useTranslations("header");
  const { data: user, isPending } = useSessionUser();
  const Wrapper = stacked ? Stack : Group;
  const fullWidth = stacked;

  if (isPending) {
    return (
      <Wrapper gap="xs">
        <Skeleton height={36} width={stacked ? "100%" : 80} radius="md" />
        <Skeleton height={36} width={stacked ? "100%" : 150} radius="md" />
      </Wrapper>
    );
  }

  if (user) {
    return (
      <LinkButton href="/dashboard" fullWidth={fullWidth} onClick={onNavigate}>
        {t("dashboard")}
      </LinkButton>
    );
  }

  return (
    <Wrapper gap="xs">
      <LinkButton
        href="/login"
        variant="default"
        fullWidth={fullWidth}
        onClick={onNavigate}
      >
        {t("login")}
      </LinkButton>
      <LinkButton href="/register" fullWidth={fullWidth} onClick={onNavigate}>
        {t("register")}
      </LinkButton>
    </Wrapper>
  );
};

export default AuthActions;
