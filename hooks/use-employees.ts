"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmployees,
  approveEmployee,
  rejectEmployee,
  updateEmployeeStatus,
  updateEmployee,
  getEmployeesCount,
} from "@/app/dashboard/actions";
import type { EmployeeStatus } from "@/types/employee";

export const useEmployees = (organizationId: string, status?: EmployeeStatus) => {
  return useQuery({
    queryKey: ["employees", organizationId, status],
    queryFn: async () => {
      const result = await getEmployees(organizationId, status);
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
      return { total: result.total, pending: result.pending, active: result.active };
    },
    enabled: !!organizationId,
  });
};

export const useApproveEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeId: string) => {
      const result = await approveEmployee(employeeId);
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

export const useRejectEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeId: string) => {
      const result = await rejectEmployee(employeeId);
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

export const useUpdateEmployeeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employeeId, status }: { employeeId: string; status: EmployeeStatus }) => {
      const result = await updateEmployeeStatus(employeeId, status);
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

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      employeeId,
      data,
    }: {
      employeeId: string;
      data: { full_name?: string; position?: string; phone?: string; email?: string };
    }) => {
      const result = await updateEmployee(employeeId, data);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};
