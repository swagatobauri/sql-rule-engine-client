// Frontend mirror of the backend API contract (sql-rule-engine-node/src/types).
// Kept in sync by hand — the two repos don't share a package.

// ── Response envelope ─────────────────────────────────────────────
// Every backend response is wrapped: success carries `data`, error carries
// `error` + optional `error_code`. See utils/api-response.utils.ts on the server.
export interface ApiSuccessBody<T> {
  response: true;
  message: string;
  data?: T;
  token?: string;
}

export interface ApiErrorBody {
  response: false;
  error: string;
  error_code?: string;
  details?: unknown;
}

// ── Auth ──────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface AuthResult {
  accessToken: string;
  user: User;
}

export interface RefreshResult {
  accessToken: string;
}

export interface MeResult {
  user: User;
}

// ── Schemas / problems ────────────────────────────────────────────
export const SCHEMA_NAMES = ["ecommerce", "banking", "social", "inventory", "analytics"] as const;
export type SchemaName = (typeof SCHEMA_NAMES)[number];

// Student-safe projection returned by the public problems API (camelCase).
export interface PublicProblem {
  id?: string;
  problem_id?: string;
  slug?: string;
  title: string;
  difficulty?: string;
  schemaName?: string;
  schema?: string;
  pattern?: string;
  concepts?: string[];
  problemStatement?: string;
  followupQuestion?: string;
}

// ── Rule engine ───────────────────────────────────────────────────
export interface NormalizeRequest {
  sql: string;
}
export interface NormalizeResult {
  normalized_sql: string | null;
  error: string | null;
}

export interface FingerprintRequest {
  sql: string;
  schema_name: SchemaName;
  problem_id?: string;
}
export interface FingerprintResult {
  fingerprint: string;
  normalized_sql: string;
}

export interface RuleIssue {
  triggered: boolean;
  issue: string;
  category: string;
  explanation: string;
}

export interface RulesRequest {
  sql: string;
}
export interface RulesResult {
  normalized_sql: string;
  issues_count: number;
  issues: RuleIssue[];
}

export interface EvaluateRequest {
  sql: string;
  schema_name: SchemaName;
  problem_id: string;
}

export interface RunQuota {
  limit: number;
  used: number;
  remaining: number;
}

export interface QuestionAttempt {
  problem_id?: string;
  raw_sql?: string;
  normalized_sql?: string;
  runtime_status?: string;
  preview_columns?: string[];
  preview_rows?: Record<string, unknown>[];
  row_count?: number;
}

export interface EvaluateResult {
  cached?: boolean;
  fingerprint?: string;
  result_hash?: string;
  correct?: boolean;
  rule_results?: RuleIssue[];
  feedback?: {
    is_correct: boolean;
    score: number;
    rule_issues: RuleIssue[];
    messages: string[];
  };
  question_attempt?: QuestionAttempt;
  error?: string;
  run_quota?: RunQuota;
}

// ── Run history ───────────────────────────────────────────────────
export interface ProblemRun {
  id: string;
  userId: string;
  problemId: string;
  schemaName: string;
  sql: string;
  correct: boolean | null;
  runtimeMs: number | null;
  error: string | null;
  createdAt: string;
}

export interface RunsQuery {
  problemId?: string;
  limit?: number;
}
export interface RunsResult {
  runs: ProblemRun[];
  count: number;
  run_quota?: RunQuota;
}

// ── Final submit + follow-up evaluation ───────────────────────────
export type ReadinessLabel = "Not Ready" | "Building" | "Almost Ready" | "Ready";
export type EvaluationStatus = "completed" | "not_required" | "failed";

export interface ExplanationEvaluationScores {
  conceptualAccuracy: number;
  depth: number;
  exampleQuality: number;
  edgeCaseAwareness: number;
  communicationClarity: number;
}

export interface ExplanationEvaluation {
  evaluationStatus: EvaluationStatus;
  readiness?: ReadinessLabel;
  scores?: ExplanationEvaluationScores;
  strengths?: string[];
  missingPoints?: string[];
  nextStep?: string;
  evaluatorMetadata: {
    domain: string;
    questionType: string;
    evaluatorType: string;
    promptVersion: string;
    rubricVersion: string;
  };
}

export interface RubricScores {
  correctOutput: number;
  sqlLogic: number;
  edgeCase: number;
  readability: number;
  explanationQuality: number | null;
}

export interface RuleResultDebrief {
  ruleCode: string;
  passed: boolean;
  message: string;
}

export interface CombinedDebriefResponse {
  success: boolean;
  attemptId: string;
  sessionQuestionId: string;
  isCorrect: boolean;
  score: number;
  readiness: ReadinessLabel;
  feedbackSummary: string;
  strengths: string[];
  mistakes: string[];
  nextStep: string;
  rubricScores: RubricScores;
  ruleResults: RuleResultDebrief[];
  explanationEvaluation: ExplanationEvaluation;
  overallNextStep: string;
}

export interface SubmitRequest {
  finalQuery: string;
  explanationText?: string;
  edgeCaseText?: string;
}

export interface EvaluateFollowupRequest {
  questionId: string;
  followupQuestion: string;
  answer: string;
}
