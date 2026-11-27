"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSupabase } from "@/shared/api/supabase/client";
import { queryCacheConfig } from "@/shared/config/query-cache";
import type { ModuleKey } from "@/shared/config/site";

import { moduleApi } from "./module";
import { moduleQueryKeys } from "./module.keys";

export const useOrganizationModulesQuery = (organizationId: string) =>
  useQuery({
    queryKey: moduleQueryKeys.forOrganization(organizationId),
    queryFn: () => moduleApi.listForOrganization(getSupabase(), organizationId),
    // Пока организация не загружена, id пустой: без запроса с невалидным uuid.
    enabled: Boolean(organizationId),
    ...queryCacheConfig.dashboard,
  });

export const useStartTrialMutation = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (module: ModuleKey) => moduleApi.startTrial(getSupabase(), organizationId, module),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: moduleQueryKeys.forOrganization(organizationId) }),
  });
};
