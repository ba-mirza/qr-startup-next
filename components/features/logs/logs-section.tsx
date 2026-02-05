"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useCheckLogs } from "@/hooks/use-logs";
import { LogsTable } from "./logs-table";
import { LogsFilters } from "./logs-filters";
import type { OfficePoint } from "@/types/organization";
import type { CheckType } from "@/types/check-log";

interface LogsSectionProps {
  organizationId: string;
  officePoints: OfficePoint[];
}

const ITEMS_PER_PAGE = 20;

export const LogsSection = ({ organizationId, officePoints }: LogsSectionProps) => {
  const [date, setDate] = useState("");
  const [checkType, setCheckType] = useState<CheckType | "all">("all");
  const [officePointId, setOfficePointId] = useState("all");
  const [page, setPage] = useState(0);

  const { data, isLoading, refetch, isFetching } = useCheckLogs(organizationId, {
    date: date || undefined,
    checkType: checkType === "all" ? undefined : checkType,
    officePointId: officePointId === "all" ? undefined : officePointId,
    limit: ITEMS_PER_PAGE,
    offset: page * ITEMS_PER_PAGE,
  });

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleReset = () => {
    setDate("");
    setCheckType("all");
    setOfficePointId("all");
    setPage(0);
  };

  const handleFilterChange = () => {
    setPage(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <LogsFilters
          date={date}
          onDateChange={(v) => {
            setDate(v);
            handleFilterChange();
          }}
          checkType={checkType}
          onCheckTypeChange={(v) => {
            setCheckType(v);
            handleFilterChange();
          }}
          officePointId={officePointId}
          onOfficePointChange={(v) => {
            setOfficePointId(v);
            handleFilterChange();
          }}
          officePoints={officePoints}
          onReset={handleReset}
        />

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

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <>
          <LogsTable logs={logs} />

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Показано {page * ITEMS_PER_PAGE + 1}-
                {Math.min((page + 1) * ITEMS_PER_PAGE, total)} из {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
