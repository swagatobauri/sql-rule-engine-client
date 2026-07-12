"use client";

import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "./client";
import { queryKeys } from "./keys";
import type { ApiSuccessBody, PublicProblem } from "./types";

async function fetchProblems(): Promise<PublicProblem[]> {
  const res = await api.get<ApiSuccessBody<PublicProblem[]>>("/problems");
  return unwrap(res.data) ?? [];
}

async function fetchProblem(id: string): Promise<PublicProblem> {
  const res = await api.get<ApiSuccessBody<PublicProblem>>(`/problems/${id}`);
  return unwrap(res.data);
}

/** GET /problems — the public problem catalogue (no auth required). */
export function useProblems() {
  return useQuery({
    queryKey: queryKeys.problems.all,
    queryFn: fetchProblems,
    staleTime: 5 * 60 * 1000, // catalogue rarely changes within a session
  });
}

/** GET /problems/:id — a single problem's public details. */
export function useProblem(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.problems.detail(id ?? ""),
    queryFn: () => fetchProblem(id as string),
    enabled: Boolean(id),
  });
}
