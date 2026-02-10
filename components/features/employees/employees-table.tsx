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
import { useToggleEmployeeActive } from "@/hooks/use-employees";
import type { Employee } from "@/types/employee";

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

const EmployeeRow = ({ employee }: { employee: Employee }) => {
  const [confirmAction, setConfirmAction] = useState<"activate" | "deactivate" | null>(null);
  const toggleActive = useToggleEmployeeActive();

  const handleToggle = (isActive: boolean) => {
    toggleActive.mutate(
      { employeeId: employee.id, isActive },
      { onSuccess: () => setConfirmAction(null) }
    );
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <span className="font-medium">{employee.full_name}</span>
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {employee.phone || "—"}
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {employee.email || "—"}
        </TableCell>
        <TableCell>
          <Badge variant={employee.is_active ? "default" : "secondary"}>
            {employee.is_active ? "Активен" : "Неактивен"}
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
              {!employee.is_active && (
                <DropdownMenuItem onClick={() => setConfirmAction("activate")}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Активировать
                </DropdownMenuItem>
              )}
              {employee.is_active && (
                <DropdownMenuItem onClick={() => setConfirmAction("deactivate")}>
                  <UserX className="h-4 w-4 mr-2" />
                  Деактивировать
                </DropdownMenuItem>
              )}
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
              onClick={() => handleToggle(confirmAction === "activate")}
              disabled={toggleActive.isPending}
            >
              {toggleActive.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
