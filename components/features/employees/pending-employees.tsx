"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2, UserPlus } from "lucide-react";
import { useEmployees, useApproveEmployee, useRejectEmployee } from "@/hooks/use-employees";
import { Skeleton } from "@/components/ui/skeleton";
import type { Employee } from "@/types/employee";

interface PendingEmployeesProps {
  organizationId: string;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const PendingEmployeeCard = ({ employee }: { employee: Employee }) => {
  const approve = useApproveEmployee();
  const reject = useRejectEmployee();

  const isLoading = approve.isPending || reject.isPending;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{employee.full_name}</CardTitle>
            <CardDescription className="mt-1">
              {employee.position || "Должность не указана"}
            </CardDescription>
          </div>
          <Badge variant="secondary">Новая заявка</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground space-y-1">
            {employee.phone && <p>Телефон: {employee.phone}</p>}
            {employee.email && <p>Email: {employee.email}</p>}
            <p>Подана: {formatDate(employee.created_at)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => approve.mutate(employee.id)}
              disabled={isLoading}
            >
              {approve.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span className="ml-2">Принять</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => reject.mutate(employee.id)}
              disabled={isLoading}
              className="text-destructive"
            >
              {reject.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              <span className="ml-2">Отклонить</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const PendingEmployees = ({ organizationId }: PendingEmployeesProps) => {
  const { data: pendingEmployees = [], isLoading } = useEmployees(organizationId, "pending");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Заявки на регистрацию</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (pendingEmployees.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <UserPlus className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Заявки на регистрацию</h3>
        <Badge variant="secondary">{pendingEmployees.length}</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {pendingEmployees.map((employee) => (
          <PendingEmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
};
