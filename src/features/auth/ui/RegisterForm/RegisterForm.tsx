"use client";

import { Alert, Anchor, Button, PasswordInput, Stack, Text, TextInput } from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Link, useRouter } from "@/i18n/navigation";

import { AuthRequestError } from "../../api/auth.api";
import { useSignUpMutation } from "../../api/auth.queries";
import { registerSchema, type RegisterValues } from "../../model/auth.schema";
import AuthCard from "../AuthCard";

type FieldErrorKey = "emailInvalid" | "passwordShort" | "passwordMismatch";

const RegisterForm = () => {
  const t = useTranslations("auth");
  const router = useRouter();
  const signUp = useSignUpMutation();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const fieldError = (message?: string) => message && t(`errors.${message as FieldErrorKey}`);

  const onSubmit = handleSubmit((values) =>
    signUp.mutate(values, {
      onSuccess: ({ needsConfirmation }) => {
        if (needsConfirmation) {
          setSentTo(values.email);
          return;
        }
        router.replace("/onboarding");
        router.refresh();
      },
    }),
  );

  if (sentTo) {
    return (
      <AuthCard title={t("register.checkEmailTitle")}>
        <Stack align="center" gap="md">
          <MailCheck size={48} color="var(--mantine-color-brand-6)" />
          <Text ta="center">{t("register.checkEmailText", { email: sentTo })}</Text>
        </Stack>
      </AuthCard>
    );
  }

  const errorKey = signUp.error instanceof AuthRequestError ? signUp.error.key : "unknown";

  return (
    <AuthCard
      title={t("register.title")}
      subtitle={t("register.subtitle")}
      footer={
        <>
          {t("register.hasAccount")}{" "}
          <Anchor component={Link} href="/login" size="sm">
            {t("register.toLogin")}
          </Anchor>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <Stack gap="md">
          {signUp.isError && <Alert color="red">{t(`errors.${errorKey}`)}</Alert>}
          <TextInput
            label={t("fields.email")}
            type="email"
            autoComplete="email"
            error={fieldError(errors.email?.message)}
            {...register("email")}
          />
          <PasswordInput
            label={t("fields.password")}
            description={t("fields.passwordHint")}
            autoComplete="new-password"
            error={fieldError(errors.password?.message)}
            {...register("password")}
          />
          <PasswordInput
            label={t("fields.passwordConfirm")}
            autoComplete="new-password"
            error={fieldError(errors.passwordConfirm?.message)}
            {...register("passwordConfirm")}
          />
          <Button type="submit" size="md" fullWidth loading={signUp.isPending}>
            {t("register.submit")}
          </Button>
        </Stack>
      </form>
    </AuthCard>
  );
};

export default RegisterForm;
