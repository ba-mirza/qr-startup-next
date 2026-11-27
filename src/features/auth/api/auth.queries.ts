"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { sessionQueryKeys } from "@/entities/session";

import { authApi } from "./auth.api";

export const useSignInMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.signIn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sessionQueryKeys.user }),
  });
};

export const useSignUpMutation = () => useMutation({ mutationFn: authApi.signUp });

export const useSignOutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.signOut,
    onSuccess: () => queryClient.clear(),
  });
};
