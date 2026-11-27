"use client";

import { Alert, Anchor, Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { Link, useRouter } from "@/i18n/navigation";

import { AuthRequestError } from "../../api/auth.api";
import { useSignInMutation } from "../../api/auth.queries";
import { loginSchema, type LoginValues } from "../../model/auth.schema";
import AuthCard from "../AuthCard";

type Props = { callbackError?: boolean };

const LoginForm = ({ callbackError = false }: Props) => {
  const t = useTranslations("auth");
  const router = useRouter();
  const signIn = useSignInMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit((values) =>
    signIn.mutate(values, {
      onSuccess: () => {
        router.replace("/dashboard");
        router.refresh();
      },
    }),
  );

  const errorKey = signIn.error instanceof AuthRequestError ? signIn.error.key : "unknown";

  return (
    <AuthCard
      title={t("login.title")}
      subtitle={t("login.subtitle")}
      footer={
        <>
          {t("login.noAccount")}{" "}
          <Anchor component={Link} href="/register" size="sm">
            {t("login.toRegister")}
          </Anchor>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <Stack gap="md">
          {signIn.isError && <Alert color="red">{t(`errors.${errorKey}`)}</Alert>}
          {callbackError && signIn.isIdle && <Alert color="red">{t("errors.callback")}</Alert>}
          <TextInput
            label={t("fields.email")}
            type="email"
            autoComplete="email"
            error={errors.email?.message && t(`errors.${errors.email.message as "emailInvalid"}`)}
            {...register("email")}
          />
          <PasswordInput
            label={t("fields.password")}
            autoComplete="current-password"
            error={
              errors.password?.message && t(`errors.${errors.password.message as "passwordShort"}`)
            }
            {...register("password")}
          />
          <Button type="submit" size="md" fullWidth loading={signIn.isPending}>
            {t("login.submit")}
          </Button>
        </Stack>
      </form>
    </AuthCard>
  );
};

export default LoginForm;
