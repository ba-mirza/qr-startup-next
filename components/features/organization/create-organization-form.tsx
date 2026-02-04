"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  createOrganizationSchema,
  type CreateOrganizationInput,
} from "@/lib/validations/organization";
import { useCreateOrganization } from "@/hooks/use-organization";
import { Loader2 } from "lucide-react";

export const CreateOrganizationForm = () => {
  const createOrg = useCreateOrganization();

  const form = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      bin: "",
    },
  });

  const onSubmit = (data: CreateOrganizationInput) => {
    createOrg.reset();
    createOrg.mutate(data);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Новая организация</CardTitle>
        <CardDescription>
          Заполните данные для создания организации
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название организации</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ТОО Компания"
                      disabled={createOrg.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>БИН</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123456789012"
                      maxLength={12}
                      disabled={createOrg.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {createOrg.error && (
              <p className="text-sm text-destructive text-center">
                {createOrg.error.message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={createOrg.isPending}
            >
              {createOrg.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Создать организацию
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
