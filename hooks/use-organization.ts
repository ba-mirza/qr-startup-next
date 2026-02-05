"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  getUserOrganization,
  createOrganization,
  getOrganizationBySlug,
} from "@/app/dashboard/actions";
import type { CreateOrganizationInput } from "@/lib/validations/organization";
import type { OrganizationWithOffices } from "@/types/organization";

const ORG_QUERY_KEY = ["organization"];

export const useUserOrganization = () => {
  return useQuery({
    queryKey: ORG_QUERY_KEY,
    queryFn: async () => {
      const result = await getUserOrganization();
      if (result.error) throw new Error(result.error);
      return result.data;
    },
  });
};

export const useOrganizationBySlug = (slug: string) => {
  return useQuery({
    queryKey: [...ORG_QUERY_KEY, slug],
    queryFn: async () => {
      const result = await getOrganizationBySlug(slug);
      if (result.error) throw new Error(result.error);
      return result.data as OrganizationWithOffices;
    },
    enabled: !!slug,
  });
};

export const useCreateOrganization = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrganizationInput) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("bin", data.bin);
      formData.append("address", data.address);
      const result = await createOrganization(formData);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData([...ORG_QUERY_KEY, data.slug], data);
        queryClient.invalidateQueries({ queryKey: ORG_QUERY_KEY });
        router.push(`/dashboard/${data.slug}`);
      }
    },
  });
};
