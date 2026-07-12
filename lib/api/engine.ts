"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "./client";
import { queryKeys } from "./keys";
import type {
  ApiSuccessBody,
  EvaluateRequest,
  EvaluateResult,
  FingerprintRequest,
  FingerprintResult,
  NormalizeRequest,
  NormalizeResult,
  RulesRequest,
  RulesResult,
  RunsQuery,
  RunsResult,
} from "./types";

/** POST /normalize — canonicalize a SQL string. */
export function useNormalize() {
  return useMutation({
    mutationFn: async (body: NormalizeRequest): Promise<NormalizeResult> => {
      const res = await api.post<ApiSuccessBody<NormalizeResult>>("/normalize", body);
      return unwrap(res.data);
    },
  });
}

/** POST /fingerprint — stable hash of a normalized query for a problem+schema. */
export function useFingerprint() {
  return useMutation({
    mutationFn: async (body: FingerprintRequest): Promise<FingerprintResult> => {
      const res = await api.post<ApiSuccessBody<FingerprintResult>>("/fingerprint", body);
      return unwrap(res.data);
    },
  });
}

/** POST /rules — run the static rule engine over a query. */
export function useRunRules() {
  return useMutation({
    mutationFn: async (body: RulesRequest): Promise<RulesResult> => {
      const res = await api.post<ApiSuccessBody<RulesResult>>("/rules", body);
      return unwrap(res.data);
    },
  });
}

/**
 * POST /evaluate — execute a query against a problem (enforces the per-question
 * run quota; a 429 surfaces as an AxiosError with error_code RUN_LIMIT_EXCEEDED).
 * Invalidates cached run history on success.
 */
export function useEvaluate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: EvaluateRequest): Promise<EvaluateResult> => {
      const res = await api.post<ApiSuccessBody<EvaluateResult>>("/evaluate", body);
      return unwrap(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.runs.all });
    },
  });
}

/** GET /runs — the authenticated user's run history (optionally per problem). */
export function useRuns(params: RunsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.runs.list(params),
    queryFn: async (): Promise<RunsResult> => {
      const res = await api.get<ApiSuccessBody<RunsResult>>("/runs", { params });
      return unwrap(res.data);
    },
  });
}
