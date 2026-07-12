import type { RunsQuery } from "./types";

// Centralized React Query keys so invalidation stays consistent across hooks.
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  problems: {
    all: ["problems"] as const,
    detail: (id: string) => ["problems", id] as const,
  },
  runs: {
    all: ["runs"] as const,
    list: (params: RunsQuery) => ["runs", params] as const,
  },
} as const;
