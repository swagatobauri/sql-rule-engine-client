import { create } from "zustand";
import type { User } from "@/lib/api/types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  /**
   * Short-lived access token. Kept in memory only (never localStorage) so it
   * can't be read by XSS. The long-lived refresh token lives in an httpOnly
   * cookie and is used to re-mint this on page load / expiry.
   */
  accessToken: string | null;
  user: User | null;
  /** `loading` until the initial refresh-on-boot resolves. */
  status: AuthStatus;
  setAuth: (accessToken: string, user: User) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  setStatus: (status: AuthStatus) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  status: "loading",
  setAuth: (accessToken, user) => set({ accessToken, user, status: "authenticated" }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearAuth: () => set({ accessToken: null, user: null, status: "unauthenticated" }),
  setStatus: (status) => set({ status }),
}));
