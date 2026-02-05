"use client";

import { useQuery } from "@tanstack/react-query";
import { getCheckLogs, getTodayStats } from "@/app/dashboard/actions";
import type { CheckType } from "@/types/check-log";

interface UseCheckLogsOptions {
  date?: string;
  employeeId?: string;
  officePointId?: string;
  checkType?: CheckType;
  limit?: number;
  offset?: number;
}

export const useCheckLogs = (
  organizationId: string,
  options?: UseCheckLogsOptions
) => {
  return useQuery({
    queryKey: ["check-logs", organizationId, options],
    queryFn: async () => {
      const result = await getCheckLogs(organizationId, options);
      if (result.error) {
        throw new Error(result.error);
      }
      return { logs: result.data, total: result.total };
    },
    enabled: !!organizationId,
  });
};

export const useTodayStats = (organizationId: string) => {
  return useQuery({
    queryKey: ["today-stats", organizationId],
    queryFn: async () => {
      const result = await getTodayStats(organizationId);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!organizationId,
    refetchInterval: 30000,
  });
};
