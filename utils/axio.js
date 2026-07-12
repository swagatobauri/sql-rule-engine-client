// Back-compat shim: the configured axios instance now lives in the API layer
// (with auth interceptors + refresh rotation). Prefer importing hooks from
// "@/lib/api"; this re-export keeps older `import { api } from "@/utils/axio"`
// call sites working against the single shared instance.
export { api } from "@/lib/api/client";
