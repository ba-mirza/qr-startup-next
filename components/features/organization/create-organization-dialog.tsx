"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Loader2, PlusIcon } from "lucide-react";

interface CreateOrganizationDialogProps {
  disabled?: boolean;
}

export const CreateOrganizationDialog = ({ disabled = false }: CreateOrganizationDialogProps) => {
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
    <Dialog>
      <DialogTrigger asChild>
        <button
          disabled={disabled}
          className={`flex items-center justify-center border rounded-lg w-80 h-80 transition-all ${disabled
              ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
              : "border-gray-200 hover:bg-red-50 hover:border-red-200 cursor-pointer active:scale-95"
            }`}
        >
          <div className="flex flex-col items-center gap-2">
            <PlusIcon size={30} className={disabled ? "text-gray-300" : "text-gray-500"} />
            <span className={disabled ? "text-gray-400" : "text-gray-500"}>
              Создать организацию
            </span>
            {disabled && (
              <span className="text-xs text-gray-400 mt-1">
                Лимит достигнут
              </span>
            )}
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новая организация</DialogTitle>
          <DialogDescription>
            Заполните данные для создания организации
          </DialogDescription>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
};
