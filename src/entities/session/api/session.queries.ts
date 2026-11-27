"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { getSupabase } from "@/shared/api/supabase/client";

export const sessionQueryKeys = {
  user: ["session", "user"] as const,
};

// Текущий пользователь на клиенте. Подписка на onAuthStateChange держит кэш в актуальном состоянии.
export const useSessionUser = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = getSupabase().auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData(sessionQueryKeys.user, session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  return useQuery({
    queryKey: sessionQueryKeys.user,
    queryFn: async () => {
      const { data } = await getSupabase().auth.getUser();
      return data.user;
    },
    staleTime: Infinity,
  });
};
