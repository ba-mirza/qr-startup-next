"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, X, Loader2, UserPlus, MapPin, Mail, Phone, Calendar } from "lucide-react";
import {
  usePendingEmployees,
  useApprovePendingEmployee,
  useRejectPendingEmployee,
} from "@/hooks/use-employees";
import { Skeleton } from "@/components/ui/skeleton";
import type { PendingEmployeeWithOffice } from "@/types/pending-employee";

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

const PendingEmployeeRow = ({
  employee,
  onSelect,
}: {
  employee: PendingEmployeeWithOffice;
  onSelect: () => void;
}) => {
  const approve = useApprovePendingEmployee();
  const reject = useRejectPendingEmployee();

  const isLoading = approve.isPending || reject.isPending;

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    approve.mutate(employee.id);
  };

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    reject.mutate(employee.id);
  };

  return (
    <div
      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={onSelect}
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{employee.full_name}</p>
        <p className="text-sm text-muted-foreground truncate">
          {employee.email || employee.phone || "Нет контактов"}
        </p>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={handleApprove}
          disabled={isLoading}
        >
          {approve.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleReject}
          disabled={isLoading}
        >
          {reject.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

const PendingEmployeeDialog = ({
  employee,
  open,
  onOpenChange,
}: {
  employee: PendingEmployeeWithOffice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const approve = useApprovePendingEmployee();
  const reject = useRejectPendingEmployee();

  if (!employee) return null;

  const isLoading = approve.isPending || reject.isPending;

  const handleApprove = () => {
    approve.mutate(employee.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const handleReject = () => {
    reject.mutate(employee.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{employee.full_name}</DialogTitle>
          <DialogDescription>Заявка на регистрацию сотрудника</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>Офис: {employee.office_point.name}</span>
            </div>
            {employee.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{employee.email}</span>
              </div>
            )}
            {employee.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{employee.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Подана: {formatDate(employee.registered_at)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button
              className="flex-1"
              onClick={handleApprove}
              disabled={isLoading}
            >
              {approve.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Принять
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-destructive"
              onClick={handleReject}
              disabled={isLoading}
            >
              {reject.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Отклонить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const PendingEmployees = ({ organizationId }: PendingEmployeesProps) => {
  const { data: pendingEmployees = [], isLoading } = usePendingEmployees(organizationId);
  const [selectedEmployee, setSelectedEmployee] = useState<PendingEmployeeWithOffice | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Заявки на регистрацию</h3>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      </div>
    );
  }

  if (pendingEmployees.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <UserPlus className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Заявки на регистрацию</h3>
        <Badge variant="secondary">{pendingEmployees.length}</Badge>
      </div>
      <div className="max-h-64 overflow-y-auto space-y-2">
        {pendingEmployees.map((employee) => (
          <PendingEmployeeRow
            key={employee.id}
            employee={employee}
            onSelect={() => setSelectedEmployee(employee)}
          />
        ))}
      </div>

      <PendingEmployeeDialog
        employee={selectedEmployee}
        open={selectedEmployee !== null}
        onOpenChange={(open) => !open && setSelectedEmployee(null)}
      />
    </div>
  );
};
