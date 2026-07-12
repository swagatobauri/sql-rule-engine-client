"use client";

import { useMutation } from "@tanstack/react-query";
import { api, unwrap } from "./client";
import type {
  ApiSuccessBody,
  CombinedDebriefResponse,
  EvaluateFollowupRequest,
  ExplanationEvaluation,
  SubmitRequest,
} from "./types";

/**
 * POST /sql/session-questions/:id/submit — final submission for a session
 * question. Returns the combined debrief (SQL feedback + explanation eval).
 * One submission per session question (a repeat returns 409 SUBMIT_LIMIT_REACHED).
 */
export function useSubmitSessionQuestion() {
  return useMutation({
    mutationFn: async ({
      sessionQuestionId,
      body,
    }: {
      sessionQuestionId: string;
      body: SubmitRequest;
    }): Promise<CombinedDebriefResponse> => {
      const res = await api.post<ApiSuccessBody<CombinedDebriefResponse>>(
        `/sql/session-questions/${sessionQuestionId}/submit`,
        body,
      );
      return unwrap(res.data);
    },
  });
}

/**
 * POST /sql/attempts/:attemptId/evaluate-followup — standalone evaluation of a
 * free-text explanation answer.
 */
export function useEvaluateFollowup() {
  return useMutation({
    mutationFn: async ({
      attemptId,
      body,
    }: {
      attemptId: string;
      body: EvaluateFollowupRequest;
    }): Promise<ExplanationEvaluation> => {
      const res = await api.post<ApiSuccessBody<ExplanationEvaluation>>(
        `/sql/attempts/${attemptId}/evaluate-followup`,
        body,
      );
      return unwrap(res.data);
    },
  });
}
