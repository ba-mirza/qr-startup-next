"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSupabase } from "@/shared/api/supabase/client";
import { queryCacheConfig } from "@/shared/config/query-cache";

import { organizationApi } from "./organization";
import { organizationQueryKeys } from "./organization.keys";

export const useOrganizationQuery = (slug: string) =>
  useQuery({
    queryKey: organizationQueryKeys.bySlug(slug),
    queryFn: () => organizationApi.getBySlug(getSupabase(), slug),
    ...queryCacheConfig.dashboard,
  });

export const useCreateOrganizationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof organizationApi.create>[1]) =>
      organizationApi.create(getSupabase(), input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: organizationQueryKeys.root }),
  });
};
