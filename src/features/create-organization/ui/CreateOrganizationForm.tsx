"use client";

import { Alert, Button, SegmentedControl, Stack, Text, TextInput } from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm, useWatch } from "react-hook-form";

import {
  CreateOrganizationError,
  useCreateOrganizationMutation,
} from "@/entities/organization";
import { useRouter } from "@/i18n/navigation";

import { createOrganizationSchema, type CreateOrganizationValues } from "../model/schema";

type ErrorKey = "nameShort" | "invalidTaxId";

const CreateOrganizationForm = () => {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const create = useCreateOrganizationMutation();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrganizationValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { name: "", taxIdType: "bin", taxId: "" },
  });

  const taxIdType = useWatch({ control, name: "taxIdType" });
  const fieldError = (message?: string) => message && t(`errors.${message as ErrorKey}`);

  const onSubmit = handleSubmit((values) =>
    create.mutate(values, {
      onSuccess: (organization) => router.replace(`/dashboard/${organization.slug}/modules`),
    }),
  );

  const errorKey = create.error instanceof CreateOrganizationError ? create.error.key : "unknown";

  return (
    <form onSubmit={onSubmit} noValidate>
      <Stack gap="md">
        {create.isError && <Alert color="red">{t(`errors.${errorKey}`)}</Alert>}
        <TextInput
          label={t("fields.name")}
          placeholder={t("fields.namePlaceholder")}
          error={fieldError(errors.name?.message)}
          {...register("name")}
        />
        <div>
          <Text size="sm" fw={500} mb={4}>
            {t("fields.taxIdType")}
          </Text>
          <Controller
            control={control}
            name="taxIdType"
            render={({ field }) => (
              <SegmentedControl
                fullWidth
                value={field.value}
                onChange={(value) => field.onChange(value)}
                data={[
                  { value: "bin", label: t("fields.bin") },
                  { value: "iin", label: t("fields.iin") },
                ]}
              />
            )}
          />
        </div>
        <TextInput
          label={taxIdType === "bin" ? t("fields.taxIdBin") : t("fields.taxIdIin")}
          description={t("fields.taxIdHint")}
          inputMode="numeric"
          maxLength={12}
          autoComplete="off"
          error={fieldError(errors.taxId?.message)}
          {...register("taxId", {
            onChange: (event) => {
              event.target.value = event.target.value.replace(/\D/g, "");
            },
          })}
        />
        <Button type="submit" size="md" fullWidth loading={create.isPending}>
          {t("submit")}
        </Button>
      </Stack>
    </form>
  );
};

export default CreateOrganizationForm;
