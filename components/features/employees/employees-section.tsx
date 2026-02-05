"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Users } from "lucide-react";
import { useEmployees } from "@/hooks/use-employees";
import { EmployeesTable } from "./employees-table";
import { PendingEmployees } from "./pending-employees";
import { Separator } from "@/components/ui/separator";
import type { EmployeeStatus } from "@/types/employee";

interface EmployeesSectionProps {
  organizationId: string;
}

type FilterStatus = EmployeeStatus | "all";

export const EmployeesSection = ({ organizationId }: EmployeesSectionProps) => {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  const { data: employees = [], isLoading, refetch, isFetching } = useEmployees(
    organizationId,
    statusFilter === "all" ? undefined : statusFilter
  );

  const activeEmployees = employees.filter((e) => e.status !== "pending");

  return (
    <div className="space-y-6">
      <PendingEmployees organizationId={organizationId} />

      <Separator />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Все сотрудники</h3>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as FilterStatus)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="inactive">Неактивные</SelectItem>
                <SelectItem value="pending">Ожидающие</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              Обновить
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <EmployeesTable
            employees={statusFilter === "all" ? activeEmployees : employees}
          />
        )}
      </div>
    </div>
  );
};
