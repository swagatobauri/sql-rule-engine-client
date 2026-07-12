import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth.store";
import type { ApiErrorBody, ApiSuccessBody, RefreshResult } from "./types";

// Backend base URL. Defaults to the local server (settings.PORT=8000, routes
// mounted under /api). Override with NEXT_PUBLIC_API_URL in .env.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  // Send/receive the httpOnly refresh cookie. Requires the server's CORS to set
  // credentials:true and an explicit origin (it does — see app.ts).
  withCredentials: true,
});

/** Unwrap the `{ response, message, data }` envelope down to `data`. */
export function unwrap<T>(body: ApiSuccessBody<T>): T {
  return body.data as T;
}

/** Human-readable message from an axios error, preferring the server's envelope. */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.error) return body.error;
    if (error.message) return error.message;
  }
  return fallback;
}

/** Machine-readable error_code from the server envelope, if present. */
export function getApiErrorCode(error: unknown): string | undefined {
  if (error instanceof AxiosError) {
    return (error.response?.data as ApiErrorBody | undefined)?.error_code;
  }
  return undefined;
}

// ── Auth token wiring ─────────────────────────────────────────────

// Attach the in-memory access token to every outgoing request.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// These must never trigger the refresh-and-retry loop (they either mint tokens
// or are the refresh call itself).
const AUTH_FREE_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];

// Single-flight refresh: parallel 401s share one refresh request instead of
// stampeding the server (and rotating the refresh token N times).
let refreshPromise: Promise<string> | null = null;

/** Mint a new access token from the refresh cookie. Bypasses interceptors. */
export async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<ApiSuccessBody<RefreshResult>>(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        const token = res.data.data?.accessToken;
        if (!token) throw new Error("Refresh response missing accessToken");
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// On a 401, transparently refresh the access token once and replay the request.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = original?.url ?? "";
    const isAuthFree = AUTH_FREE_PATHS.some((path) => url.includes(path));

    if (status === 401 && original && !original._retry && !isAuthFree) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        useAuthStore.getState().setAccessToken(token);
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (refreshError) {
        // Refresh failed (expired/revoked/reused) — the session is over.
        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          window.location.assign("/login");
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
