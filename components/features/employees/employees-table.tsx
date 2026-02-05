"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, UserCheck, UserX, Loader2 } from "lucide-react";
import { useState } from "react";
import { useUpdateEmployeeStatus } from "@/hooks/use-employees";
import type { Employee, EmployeeStatus } from "@/types/employee";

interface EmployeesTableProps {
  employees: Employee[];
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const statusLabels: Record<EmployeeStatus, string> = {
  pending: "Ожидает",
  active: "Активен",
  inactive: "Неактивен",
};

const statusVariants: Record<EmployeeStatus, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  active: "default",
  inactive: "destructive",
};

const EmployeeRow = ({ employee }: { employee: Employee }) => {
  const [confirmAction, setConfirmAction] = useState<"activate" | "deactivate" | null>(null);
  const updateStatus = useUpdateEmployeeStatus();

  const handleStatusChange = (newStatus: EmployeeStatus) => {
    updateStatus.mutate(
      { employeeId: employee.id, status: newStatus },
      { onSuccess: () => setConfirmAction(null) }
    );
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex flex-col">
            <span className="font-medium">{employee.full_name}</span>
            {employee.position && (
              <span className="text-xs text-muted-foreground">{employee.position}</span>
            )}
          </div>
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {employee.phone || "—"}
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {employee.email || "—"}
        </TableCell>
        <TableCell>
          <Badge variant={statusVariants[employee.status]}>
            {statusLabels[employee.status]}
          </Badge>
        </TableCell>
        <TableCell className="hidden sm:table-cell text-muted-foreground">
          {formatDate(employee.created_at)}
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {employee.status !== "active" && (
                <DropdownMenuItem onClick={() => setConfirmAction("activate")}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Активировать
                </DropdownMenuItem>
              )}
              {employee.status === "active" && (
                <DropdownMenuItem onClick={() => setConfirmAction("deactivate")}>
                  <UserX className="h-4 w-4 mr-2" />
                  Деактивировать
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                Редактировать
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <AlertDialog open={confirmAction !== null} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "activate" ? "Активировать сотрудника?" : "Деактивировать сотрудника?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "activate"
                ? "Сотрудник сможет отмечаться через QR-код."
                : "Сотрудник не сможет отмечаться через QR-код."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleStatusChange(confirmAction === "activate" ? "active" : "inactive")}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {confirmAction === "activate" ? "Активировать" : "Деактивировать"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const EmployeesTable = ({ employees }: EmployeesTableProps) => {
  if (employees.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Нет сотрудников
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Сотрудник</TableHead>
            <TableHead className="hidden md:table-cell">Телефон</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="hidden sm:table-cell">Дата</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <EmployeeRow key={employee.id} employee={employee} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
