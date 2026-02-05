"use client";

import { useState } from "react";
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
import { Plus, Loader2 } from "lucide-react";
import { useCreateOfficePoint } from "@/hooks/use-settings";
import {
  createOfficePointSchema,
  type CreateOfficePointInput,
} from "@/lib/validations/office-point";

interface AddOfficePointDialogProps {
  organizationId: string;
}

export const AddOfficePointDialog = ({ organizationId }: AddOfficePointDialogProps) => {
  const [open, setOpen] = useState(false);
  const createPoint = useCreateOfficePoint(organizationId);

  const form = useForm<CreateOfficePointInput>({
    resolver: zodResolver(createOfficePointSchema),
    defaultValues: {
      name: "",
      address: "",
    },
  });

  const onSubmit = (data: CreateOfficePointInput) => {
    createPoint.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Добавить точку
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новая офисная точка</DialogTitle>
          <DialogDescription>
            Добавьте дополнительную точку для отметки посещений
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Офис на Абая"
                      disabled={createPoint.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Адрес (опционально)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="г. Атырау, ул. Абая 1"
                      disabled={createPoint.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {createPoint.error && (
              <p className="text-sm text-destructive text-center">
                {createPoint.error.message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={createPoint.isPending}
            >
              {createPoint.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Создать точку
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
