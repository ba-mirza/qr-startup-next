"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { CheckLogWithRelations } from "@/types/check-log";

interface UseRealtimeLogsOptions {
  organizationId: string;
  enabled?: boolean;
  onNewLog?: (log: CheckLogWithRelations) => void;
}

export const useRealtimeLogs = ({
  organizationId,
  enabled = true,
  onNewLog,
}: UseRealtimeLogsOptions) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newLogsCount, setNewLogsCount] = useState(0);

  useEffect(() => {
    if (!enabled || !organizationId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`check_logs:${organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "check_logs",
        },
        async (payload) => {
          const newLog = payload.new as { id: string; employee_id: string; office_point_id: string };

          // Fetch full log with relations
          const { data: fullLog } = await supabase
            .from("check_logs")
            .select(`
              *,
              employee:employees(id, full_name, position, organization_id),
              office_point:office_points(id, name, organization_id)
            `)
            .eq("id", newLog.id)
            .single();

          if (fullLog && fullLog.employee?.organization_id === organizationId) {
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["check-logs", organizationId] });
            queryClient.invalidateQueries({ queryKey: ["today-stats", organizationId] });

            setNewLogsCount((prev) => prev + 1);

            if (onNewLog) {
              onNewLog(fullLog as CheckLogWithRelations);
            }
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [organizationId, enabled, queryClient, onNewLog]);

  const resetNewLogsCount = () => {
    setNewLogsCount(0);
  };

  return {
    isConnected,
    newLogsCount,
    resetNewLogsCount,
  };
};
