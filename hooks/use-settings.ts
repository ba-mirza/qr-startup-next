"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOfficePoint,
  deleteOfficePoint,
  regenerateOfficePointQR,
  createRegistrationQR,
  getRegistrationQRCodes,
  deactivateRegistrationQR,
  updateOrganizationSettings,
} from "@/app/dashboard/actions";
import type { CreateOfficePointInput } from "@/lib/validations/office-point";
import type { OrganizationSettings } from "@/types/organization";

const OFFICE_POINTS_KEY = ["office-points"];
const REGISTRATION_QR_KEY = ["registration-qr"];
const ORG_KEY = ["organization"];

export const useCreateOfficePoint = (organizationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOfficePointInput) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("address", data.address || "");
      const result = await createOfficePoint(organizationId, formData);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_KEY });
      queryClient.invalidateQueries({ queryKey: OFFICE_POINTS_KEY });
    },
  });
};

export const useDeleteOfficePoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (officePointId: string) => {
      const result = await deleteOfficePoint(officePointId);
      if (result.error) throw new Error(result.error);
      return result.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_KEY });
      queryClient.invalidateQueries({ queryKey: OFFICE_POINTS_KEY });
    },
  });
};

export const useRegenerateOfficePointQR = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (officePointId: string) => {
      const result = await regenerateOfficePointQR(officePointId);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_KEY });
      queryClient.invalidateQueries({ queryKey: OFFICE_POINTS_KEY });
    },
  });
};

export const useRegistrationQRCodes = (organizationId: string) => {
  return useQuery({
    queryKey: [...REGISTRATION_QR_KEY, organizationId],
    queryFn: async () => {
      const result = await getRegistrationQRCodes(organizationId);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    enabled: !!organizationId,
  });
};

export const useCreateRegistrationQR = (organizationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expiresInHours: number) => {
      const result = await createRegistrationQR(organizationId, expiresInHours);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REGISTRATION_QR_KEY });
    },
  });
};

export const useDeactivateRegistrationQR = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (qrId: string) => {
      const result = await deactivateRegistrationQR(qrId);
      if (result.error) throw new Error(result.error);
      return result.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REGISTRATION_QR_KEY });
    },
  });
};

export const useUpdateOrganizationSettings = (organizationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: OrganizationSettings) => {
      const result = await updateOrganizationSettings(organizationId, settings);
      if (result.error) throw new Error(result.error);
      return result.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_KEY });
    },
  });
};
