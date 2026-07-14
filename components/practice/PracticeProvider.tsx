"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_QUERY, RESULT, EXPECTED_OUTPUT, RUBRIC, TIMER } from "@/data/session";
import { useProblem } from "@/lib/api/problems";
import { useEvaluate } from "@/lib/api/engine";
import { useSubmitSessionQuestion } from "@/lib/api/submission";
import { getApiErrorCode, getApiErrorMessage } from "@/lib/api/client";
import type { CombinedDebriefResponse, SchemaName } from "@/lib/api/types";

/* ── Context value types ──────────────────────────────────────── */
export type RunResult = {
  success: boolean;
  columns?: string[];
  rows?: string[][];
  rowCount?: number;
  error?: string;
  durationMs: number;
};

export type PreviousRun = {
  n: number;
  success: boolean;
  rowCount: number;
  durationMs: number;
};

export type EvaluationItem = {
  icon: string;
  tint: string;
  label: string;
  fill: number;
  weight: number;
  earned: number;
};

export type Evaluation = {
  items: EvaluationItem[];
  total: number;
};

export type ExpectedOutput = {
  columns: string[];
  rows: string[][];
};

export type TimerState = {
  remainingSeconds: number;
  totalSeconds: number;
};

export type SubmitAnswer = {
  logic: string;
  edge: string;
};

export type PracticeContextValue = {
  query: string;
  setQuery: (value: string) => void;
  runResult: RunResult | null;
  runQuery: () => { capped: boolean };
  runCount: number;
  maxRuns: number;
  previousRuns: PreviousRun[];
  format: () => void;
  clear: () => void;
  evaluation: Evaluation | null;
  submitted: boolean;
  submit: (answer: SubmitAnswer) => void;
  expected: ExpectedOutput;
  timer: TimerState;
  questionIndex: number;
  goPrev: () => void;
  goNext: () => void;
  // Live backend state (populated when the session is tied to a real problem
  // via ?q=<id>; otherwise the provider runs in local-mock mode).
  isRunning: boolean;
  isSubmitting: boolean;
  debrief: CombinedDebriefResponse | null;
  submitError: string | null;
};

const PracticeContext = createContext<PracticeContextValue | null>(null);

export function usePractice(): PracticeContextValue {
  const ctx = useContext(PracticeContext);
  if (!ctx) throw new Error("usePractice must be used within <PracticeProvider>");
  return ctx;
}

const MAX_RUNS = 5;

// Naive but deterministic SQL pretty-printer: breaks major clauses onto their
// own lines and normalises keyword casing. Good enough for the "Format" action.
function formatSql(sql: string): string {
  const clauses = ["SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "LIMIT", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN"];
  let out = sql.replace(/[ \t]+/g, " ").trim();
  clauses
    .sort((a, b) => b.length - a.length)
    .forEach((c) => {
      const re = new RegExp(`\\s*\\b${c.replace(/ /g, "\\s+")}\\b`, "gi");
      out = out.replace(re, `\n${c}`);
    });
  return out
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function countMatches(sql: string, words: string[]): number {
  const upper = sql.toUpperCase();
  return words.reduce((n, w) => n + (upper.includes(w) ? 1 : 0), 0);
}

// Local-mock scorer — used only when the session isn't tied to a real problem.
function mockEvaluate(sql: string, runOk: boolean, logic: string, edge: string): Evaluation {
  const upper = sql.toUpperCase();
  const lines = sql.split("\n").filter((l) => l.trim() && !l.trim().startsWith("--"));

  const correct = runOk ? (upper.includes("GROUP BY") || upper.includes("MIN(") ? 92 : 70) : 12;

  const logicFeatures = countMatches(sql, ["JOIN", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "SELECT"]);
  const sqlLogic = Math.min(100, 25 + logicFeatures * 13);

  const edgeLen = edge.trim().length;
  const edgeCases = edgeLen === 0 ? 8 : Math.min(100, 30 + Math.floor(edgeLen / 4));

  const logicLen = logic.trim().length;
  const explanation = logicLen === 0 ? 0 : Math.min(100, 25 + Math.floor(logicLen / 4));

  const upperKw = countMatches(sql, ["SELECT", "FROM", "WHERE"]);
  const readability = Math.min(100, 35 + lines.length * 7 + upperKw * 4);

  const items: EvaluationItem[] = RUBRIC.map((r) => {
    const fill =
      r.label.startsWith("Correct") ? correct :
      r.label.startsWith("SQL Logic") ? sqlLogic :
      r.label.startsWith("Edge") ? edgeCases :
      r.label.startsWith("Explanation") ? explanation :
      readability;
    const weight = Number(r.label.match(/\((\d+)%\)/)?.[1] ?? 0);
    return { ...r, fill, weight, earned: Math.round((fill / 100) * weight) };
  });

  const total = items.reduce((sum, i) => sum + i.earned, 0);
  return { items, total };
}

// Map the backend debrief onto the rubric bars. rubricScores are earned points
// out of each dimension's max (correctOutput/sqlLogic max 30, edge/readability
// max 20); `score` is the 0-100 total.
function debriefToEvaluation(debrief: CombinedDebriefResponse): Evaluation {
  const r = debrief.rubricScores;
  const defs = [
    { icon: "Target", tint: "text-brand", label: "Correct Output", earned: r.correctOutput, weight: 30 },
    { icon: "Brain", tint: "text-amber-500", label: "SQL Logic", earned: r.sqlLogic, weight: 30 },
    { icon: "CircleCheck", tint: "text-emerald-500", label: "Edge Cases", earned: r.edgeCase, weight: 20 },
    { icon: "AlignLeft", tint: "text-rose-400", label: "Query Readability", earned: r.readability, weight: 20 },
  ];
  const items: EvaluationItem[] = defs.map((d) => ({
    ...d,
    fill: d.weight ? Math.round((d.earned / d.weight) * 100) : 0,
  }));
  return { items, total: debrief.score };
}

function makeSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `sq_${crypto.randomUUID()}`;
  }
  return `sq_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
}

export default function PracticeProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState<string>(DEFAULT_QUERY);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [runCount, setRunCount] = useState(0);
  const [maxRuns, setMaxRuns] = useState(MAX_RUNS);
  const [previousRuns, setPreviousRuns] = useState<PreviousRun[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(4);
  const [debrief, setDebrief] = useState<CombinedDebriefResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Resolve the target problem from ?q=<id> on the client (avoids the Next 15
  // useSearchParams Suspense requirement and any SSR/hydration mismatch).
  const [problemId, setProblemId] = useState<string | undefined>(undefined);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setProblemId(q);
  }, []);

  const { data: problem } = useProblem(problemId);
  const schemaName = (problem?.schemaName as SchemaName | undefined) ?? (problem?.schema as SchemaName | undefined) ?? "ecommerce";
  const isLive = Boolean(problemId);

  const evaluate = useEvaluate();
  const submitMutation = useSubmitSessionQuestion();
  const sessionIdRef = useRef<string | null>(null);

  const pushRun = useCallback((run: Omit<PreviousRun, "n">) => {
    setPreviousRuns((prev) => [{ n: prev.length + 1, ...run }, ...prev].slice(0, 8));
  }, []);

  const runQuery = useCallback((): { capped: boolean } => {
    if (runCount >= maxRuns) return { capped: true };

    // Local-mock mode (standalone /practice with no problem context).
    if (!isLive || !problemId) {
      const trimmed = query.replace(/--.*$/gm, "").trim();
      const ok = /\bselect\b/i.test(trimmed) && /\bfrom\b/i.test(trimmed);
      const durationMs = 150 + (query.length % 180);
      const result: RunResult = ok
        ? { success: true, columns: RESULT.columns, rows: RESULT.rows, rowCount: RESULT.rows.length, durationMs }
        : {
            success: false,
            error: trimmed ? "Syntax error: a valid query needs SELECT … FROM …" : "Query is empty.",
            durationMs,
          };
      setRunResult(result);
      setRunCount((c) => c + 1);
      pushRun({ success: result.success, rowCount: result.rowCount ?? 0, durationMs });
      return { capped: false };
    }

    // Live mode: execute against the backend (consumes the run quota).
    const startedAt = Date.now();
    setRunResult(null);
    setRunCount((c) => c + 1); // optimistic; reconciled from run_quota below
    evaluate.mutate(
      { sql: query, schema_name: schemaName, problem_id: problemId },
      {
        onSuccess: (data) => {
          const attempt = data.question_attempt;
          const columns = attempt?.preview_columns ?? [];
          const rows = (attempt?.preview_rows ?? []).map((row) =>
            columns.map((col) => String(row[col] ?? "")),
          );
          const durationMs = Date.now() - startedAt;
          setRunResult({ success: true, columns, rows, rowCount: attempt?.row_count ?? rows.length, durationMs });
          if (data.run_quota) {
            setMaxRuns(data.run_quota.limit);
            setRunCount(data.run_quota.used);
          }
          pushRun({ success: true, rowCount: attempt?.row_count ?? rows.length, durationMs });
        },
        onError: (error) => {
          const durationMs = Date.now() - startedAt;
          setRunResult({ success: false, error: getApiErrorMessage(error, "Query failed"), durationMs });
          if (getApiErrorCode(error) === "RUN_LIMIT_EXCEEDED") setRunCount(maxRuns);
          pushRun({ success: false, rowCount: 0, durationMs });
        },
      },
    );
    return { capped: false };
  }, [runCount, maxRuns, isLive, problemId, query, schemaName, evaluate, pushRun]);

  const format = useCallback(() => setQuery((q) => formatSql(q)), []);
  const clear = useCallback(() => {
    setQuery("");
    setRunResult(null);
  }, []);

  const submit = useCallback(
    ({ logic, edge }: SubmitAnswer): void => {
      setSubmitError(null);

      // Local-mock mode.
      if (!isLive) {
        const runOk = runResult?.success ?? false;
        setEvaluation(mockEvaluate(query, runOk, logic, edge));
        setSubmitted(true);
        return;
      }

      if (!sessionIdRef.current) sessionIdRef.current = makeSessionId();
      submitMutation.mutate(
        {
          sessionQuestionId: sessionIdRef.current,
          body: { finalQuery: query, explanationText: logic, edgeCaseText: edge },
        },
        {
          onSuccess: (data) => {
            setDebrief(data);
            setEvaluation(debriefToEvaluation(data));
            setSubmitted(true);
          },
          onError: (error) => setSubmitError(getApiErrorMessage(error, "Submission failed")),
        },
      );
    },
    [isLive, query, runResult, submitMutation],
  );

  const goPrev = useCallback(() => setQuestionIndex((i) => Math.max(1, i - 1)), []);
  const goNext = useCallback(() => setQuestionIndex((i) => Math.min(20, i + 1)), []);

  const value = useMemo<PracticeContextValue>(
    () => ({
      query, setQuery,
      runResult, runQuery, runCount, maxRuns,
      previousRuns,
      format, clear,
      evaluation, submitted, submit,
      expected: EXPECTED_OUTPUT,
      timer: TIMER,
      questionIndex, goPrev, goNext,
      isRunning: evaluate.isPending,
      isSubmitting: submitMutation.isPending,
      debrief,
      submitError,
    }),
    [
      query, runResult, runQuery, runCount, maxRuns, previousRuns, format, clear,
      evaluation, submitted, submit, questionIndex, goPrev, goNext,
      evaluate.isPending, submitMutation.isPending, debrief, submitError,
    ],
  );

  return <PracticeContext.Provider value={value}>{children}</PracticeContext.Provider>;
}
