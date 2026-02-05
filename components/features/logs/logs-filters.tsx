"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, X } from "lucide-react";
import type { OfficePoint } from "@/types/organization";
import type { CheckType } from "@/types/check-log";

interface LogsFiltersProps {
  date: string;
  onDateChange: (date: string) => void;
  checkType: CheckType | "all";
  onCheckTypeChange: (type: CheckType | "all") => void;
  officePointId: string;
  onOfficePointChange: (id: string) => void;
  officePoints: OfficePoint[];
  onReset: () => void;
}

export const LogsFilters = ({
  date,
  onDateChange,
  checkType,
  onCheckTypeChange,
  officePointId,
  onOfficePointChange,
  officePoints,
  onReset,
}: LogsFiltersProps) => {
  const hasFilters = date || checkType !== "all" || officePointId !== "all";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="pl-10 w-[180px]"
        />
      </div>

      <Select value={checkType} onValueChange={(v) => onCheckTypeChange(v as CheckType | "all")}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Тип" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все типы</SelectItem>
          <SelectItem value="check_in">Входы</SelectItem>
          <SelectItem value="check_out">Выходы</SelectItem>
        </SelectContent>
      </Select>

      <Select value={officePointId} onValueChange={onOfficePointChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Точка" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все точки</SelectItem>
          {officePoints.map((point) => (
            <SelectItem key={point.id} value={point.id}>
              {point.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="h-4 w-4 mr-1" />
          Сбросить
        </Button>
      )}
    </div>
  );
};
