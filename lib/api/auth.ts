"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, refreshAccessToken, unwrap } from "./client";
import { queryKeys } from "./keys";
import { useAuthStore } from "@/store/auth.store";
import type { ApiSuccessBody, AuthResult, Credentials, MeResult } from "./types";

async function loginRequest(credentials: Credentials): Promise<AuthResult> {
  const res = await api.post<ApiSuccessBody<AuthResult>>("/auth/login", credentials);
  return unwrap(res.data);
}

async function registerRequest(credentials: Credentials): Promise<AuthResult> {
  const res = await api.post<ApiSuccessBody<AuthResult>>("/auth/register", credentials);
  return unwrap(res.data);
}

async function fetchMe(): Promise<MeResult> {
  const res = await api.get<ApiSuccessBody<MeResult>>("/auth/me");
  return unwrap(res.data);
}

/** POST /auth/login — stores the token+user on success. */
export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: ({ accessToken, user }) => {
      setAuth(accessToken, user);
      queryClient.setQueryData(queryKeys.auth.me, { user });
    },
  });
}

/**
 * POST /auth/register — stores the token+user on success.
 * NOTE: the backend register endpoint accepts only { email, password }. The
 * signup form's `name`/`confirmPassword` are client-side only and not persisted.
 */
export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerRequest,
    onSuccess: ({ accessToken, user }) => {
      setAuth(accessToken, user);
      queryClient.setQueryData(queryKeys.auth.me, { user });
    },
  });
}

/** POST /auth/logout — clears the session even if the network call fails. */
export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSettled: () => {
      clearAuth();
      queryClient.clear();
    },
  });
}

/** GET /auth/me — only runs once an access token is present. */
export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: fetchMe,
    enabled: Boolean(accessToken),
  });
}

/**
 * Restore the session on app load by exchanging the httpOnly refresh cookie for
 * a fresh access token, then hydrating the user. Call once at the app root.
 */
export async function bootstrapAuth(): Promise<void> {
  const { setAuth, clearAuth, setStatus } = useAuthStore.getState();
  setStatus("loading");
  try {
    const token = await refreshAccessToken();
    useAuthStore.getState().setAccessToken(token);
    const { user } = await fetchMe();
    setAuth(token, user);
  } catch {
    clearAuth();
  }
}
