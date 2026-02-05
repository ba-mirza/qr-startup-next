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
import { LogIn, LogOut, MapPin } from "lucide-react";
import type { CheckLogWithRelations } from "@/types/check-log";

interface LogsTableProps {
  logs: CheckLogWithRelations[];
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
};

export const LogsTable = ({ logs }: LogsTableProps) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Нет записей за выбранный период
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Время</TableHead>
            <TableHead>Сотрудник</TableHead>
            <TableHead>Тип</TableHead>
            <TableHead>Точка</TableHead>
            <TableHead className="hidden md:table-cell">Геолокация</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-mono">
                <div className="flex flex-col">
                  <span className="font-medium">{formatTime(log.checked_at)}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(log.checked_at)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{log.employee.full_name}</span>
                  {log.employee.position && (
                    <span className="text-xs text-muted-foreground">
                      {log.employee.position}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {log.check_type === "check_in" ? (
                  <Badge variant="default" className="bg-green-600">
                    <LogIn className="h-3 w-3 mr-1" />
                    Вход
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <LogOut className="h-3 w-3 mr-1" />
                    Выход
                  </Badge>
                )}
              </TableCell>
              <TableCell>{log.office_point.name}</TableCell>
              <TableCell className="hidden md:table-cell">
                {log.geo_location ? (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {log.geo_location.lat.toFixed(4)}, {log.geo_location.lng.toFixed(4)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
