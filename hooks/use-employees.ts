"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmployees,
  toggleEmployeeActive,
  deleteEmployee,
  getEmployeesCount,
  getPendingEmployees,
  approvePendingEmployee,
  rejectPendingEmployee,
  getPendingEmployeesCount,
} from "@/app/dashboard/actions";

export const useEmployees = (organizationId: string, isActive?: boolean) => {
  return useQuery({
    queryKey: ["employees", organizationId, isActive],
    queryFn: async () => {
      const result = await getEmployees(organizationId, isActive);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!organizationId,
  });
};

export const useEmployeesCount = (organizationId: string) => {
  return useQuery({
    queryKey: ["employees-count", organizationId],
    queryFn: async () => {
      const result = await getEmployeesCount(organizationId);
      if (result.error) {
        throw new Error(result.error);
      }
      return { total: result.total, active: result.active, inactive: result.inactive };
    },
    enabled: !!organizationId,
  });
};

export const useToggleEmployeeActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employeeId, isActive }: { employeeId: string; isActive: boolean }) => {
      const result = await toggleEmployeeActive(employeeId, isActive);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employees-count"] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeId: string) => {
      const result = await deleteEmployee(employeeId);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employees-count"] });
    },
  });
};

export const usePendingEmployees = (organizationId: string) => {
  return useQuery({
    queryKey: ["pending-employees", organizationId],
    queryFn: async () => {
      const result = await getPendingEmployees(organizationId);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!organizationId,
  });
};

export const usePendingEmployeesCount = (organizationId: string) => {
  return useQuery({
    queryKey: ["pending-employees-count", organizationId],
    queryFn: async () => {
      const result = await getPendingEmployeesCount(organizationId);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.count;
    },
    enabled: !!organizationId,
  });
};

export const useApprovePendingEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pendingEmployeeId: string) => {
      const result = await approvePendingEmployee(pendingEmployeeId);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-employees"] });
      queryClient.invalidateQueries({ queryKey: ["pending-employees-count"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employees-count"] });
    },
  });
};

export const useRejectPendingEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pendingEmployeeId: string) => {
      const result = await rejectPendingEmployee(pendingEmployeeId);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-employees"] });
      queryClient.invalidateQueries({ queryKey: ["pending-employees-count"] });
    },
  });
};
