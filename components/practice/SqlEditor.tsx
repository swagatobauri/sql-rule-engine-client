"use client";

import { useRef, useState } from "react";
import {
  AlignLeft,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  Columns3,
  Database,
  Info,
  KeyRound,
  Link2,
  Maximize2,
  Minimize2,
  Play,
  SquareTerminal,
  Trash2,
} from "lucide-react";
import { tokenizeLine, TOKEN_CLASS } from "@/lib/sqlHighlight";
import { SESSION, SCHEMA } from "@/data/session";
import { usePractice } from "./PracticeProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TreeExpander,
  TreeIcon,
  TreeLabel,
  TreeNode,
  TreeNodeContent,
  TreeNodeTrigger,
  TreeProvider,
  TreeView,
} from "@/components/kibo-ui/tree";

/* ── Types (the provider is JS; keep the surface loose) ───────── */
type RunResult = {
  success: boolean;
  columns?: string[];
  rows?: string[][];
  rowCount?: number;
  error?: string;
  durationMs: number;
} | null;

type PreviousRun = {
  n: number;
  success: boolean;
  rowCount: number;
  durationMs: number;
};

type PracticeCtx = {
  query: string;
  setQuery: (v: string) => void;
  runQuery: () => { capped?: boolean } | undefined;
  runResult: RunResult;
  runCount: number;
  maxRuns: number;
  previousRuns: PreviousRun[];
  format: () => void;
  clear: () => void;
  isRunning: boolean;
};

type SchemaTable = {
  name: string;
  columnCount: number;
  columns: [string, string, string][];
};

/* ── Highlighted, read-only layer behind the transparent textarea ── */
function HighlightLayer({
  source,
  innerRef,
}: {
  source: string;
  innerRef: React.RefObject<HTMLPreElement>;
}) {
  const lines = source.split("\n");
  return (
    <pre
      ref={innerRef}
      aria-hidden
      className="absolute inset-0 m-0 overflow-auto bg-white font-mono text-[12.5px] leading-[1.55] py-3 pointer-events-none"
    >
      {lines.map((line, i) => {
        const tokens = tokenizeLine(line);
        return (
          <div key={i} className="flex">
            <span className="select-none w-10 shrink-0 text-right pr-3 text-slate-300">
              {i + 1}
            </span>
            <code className="whitespace-pre">
              {tokens.length === 0
                ? " "
                : tokens.map((t: { type: string; value: string }, j: number) => (
                    <span
                      key={j}
                      className={(TOKEN_CLASS as Record<string, string>)[t.type]}
                    >
                      {t.value}
                    </span>
                  ))}
            </code>
          </div>
        );
      })}
    </pre>
  );
}

function CodeEditor({
  value,
  onChange,
  onRun,
}: {
  value: string;
  onChange: (v: string) => void;
  onRun: () => void;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  function syncScroll() {
    if (preRef.current && taRef.current) {
      preRef.current.scrollTop = taRef.current.scrollTop;
      preRef.current.scrollLeft = taRef.current.scrollLeft;
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onRun();
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const { selectionStart: s, selectionEnd: end } = el;
      const next = value.slice(0, s) + "  " + value.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = s + 2;
      });
    }
  }

  return (
    <div className="relative h-full min-h-[240px]">
      <HighlightLayer source={value || ""} innerRef={preRef} />
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        onKeyDown={onKeyDown}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        wrap="off"
        aria-label="SQL editor"
        className="absolute inset-0 m-0 resize-none overflow-auto bg-transparent font-mono text-[12.5px] leading-[1.55] py-3 pr-3 text-transparent caret-ink outline-none whitespace-pre"
        style={{ paddingLeft: "2.5rem" }}
      />
    </div>
  );
}

/* ── Schema explorer — the "file explorer" side panel ─────────── */
function KeyBadge({ k }: { k: string }) {
  if (!k) return null;
  return (
    <span className="inline-flex items-center gap-1">
      <Badge
        variant="secondary"
        className="h-4 rounded px-1 text-[9px] font-bold bg-amber-100 text-amber-700"
      >
        {k}
      </Badge>
      {k === "PK" ? (
        <KeyRound size={11} className="text-amber-500" />
      ) : (
        <Link2 size={11} className="text-sky-500" />
      )}
    </span>
  );
}

function SchemaExplorer() {
  const db = SESSION.database;
  const tables = SCHEMA as SchemaTable[];
  const expandedIds = [db, ...tables.map((t) => t.name)];

  return (
    <div className="h-full overflow-y-auto bg-muted/40 p-2">
      <p className="px-2 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Schema
      </p>
      <TreeProvider
        defaultExpandedIds={expandedIds}
        showLines
        indent={14}
        className="bg-transparent"
      >
        <TreeView>
          <TreeNode nodeId={db}>
            <TreeNodeTrigger>
              <TreeExpander hasChildren />
              <TreeIcon
                hasChildren
                icon={<Database className="h-4 w-4 text-brand" />}
              />
              <TreeLabel className="font-semibold">{db}</TreeLabel>
            </TreeNodeTrigger>
            <TreeNodeContent hasChildren>
              {tables.map((table, ti) => (
                <TreeNode
                  key={table.name}
                  level={1}
                  nodeId={table.name}
                  isLast={ti === tables.length - 1}
                >
                  <TreeNodeTrigger>
                    <TreeExpander hasChildren />
                    <TreeIcon hasChildren />
                    <TreeLabel>{table.name}</TreeLabel>
                    <span className="ml-auto pl-2 text-[10.5px] text-muted-foreground">
                      {table.columnCount}
                    </span>
                  </TreeNodeTrigger>
                  <TreeNodeContent hasChildren>
                    {table.columns.map(([name, type, key], ci) => (
                      <TreeNode
                        key={name}
                        level={2}
                        nodeId={`${table.name}.${name}`}
                        isLast={ci === table.columns.length - 1}
                      >
                        <TreeNodeTrigger>
                          <TreeExpander />
                          <TreeIcon
                            icon={<Columns3 className="h-3.5 w-3.5 text-ink/40" />}
                          />
                          <TreeLabel className="flex items-center gap-2">
                            <span className="font-mono text-ink/80">{name}</span>
                            <span className="text-[10.5px] text-muted-foreground">
                              {type}
                            </span>
                            {key && <KeyBadge k={key} />}
                          </TreeLabel>
                        </TreeNodeTrigger>
                      </TreeNode>
                    ))}
                  </TreeNodeContent>
                </TreeNode>
              ))}
            </TreeNodeContent>
          </TreeNode>
        </TreeView>
      </TreeProvider>
    </div>
  );
}

/* ── Result rendering ─────────────────────────────────────────── */
function ResultTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div className="mt-3 rounded-xl border overflow-x-auto">
      <Table className="text-[12.5px]">
        <TableHeader>
          <TableRow className="bg-muted/60">
            {columns.map((c) => (
              <TableHead key={c} className="h-9 font-semibold text-body">
                {c}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i}>
              {r.map((cell, j) => (
                <TableCell key={j} className="py-2">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EmptyResult() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-muted/50 border py-10 text-center">
      <Play size={20} className="text-ink/30" fill="currentColor" strokeWidth={0} />
      <p className="mt-2 text-[12.5px] font-semibold text-ink/70">
        Run your query to see results
      </p>
      <p className="text-[11.5px] text-body">Press Run Query or Ctrl+Enter.</p>
    </div>
  );
}

function RunningResult() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-muted/50 border py-10 text-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand" />
      <p className="mt-2 text-[12.5px] font-semibold text-ink/70">Running your query…</p>
    </div>
  );
}

function QueryResultBody({
  runResult,
  runCount,
  maxRuns,
  isRunning,
}: {
  runResult: RunResult;
  runCount: number;
  maxRuns: number;
  isRunning: boolean;
}) {
  if (isRunning) return <RunningResult />;
  if (!runResult) return <EmptyResult />;

  if (!runResult.success) {
    return (
      <>
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-100 px-3 py-2">
          <CircleAlert size={15} className="text-rose-500 shrink-0" />
          <span className="text-[12.5px] font-semibold text-rose-600">
            {runResult.error}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 border px-3 py-2.5 text-[12px] text-body">
          <Info size={15} className="text-ink/35 shrink-0" />
          Fix the query and run again. You have {maxRuns - runCount} run
          {maxRuns - runCount === 1 ? "" : "s"} left.
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
        <span className="flex items-center gap-2 text-[12.5px] font-semibold text-emerald-600">
          <CircleCheck size={15} /> Query executed successfully
        </span>
        <span className="text-[12px] text-body">
          Rows: <b className="text-ink">{runResult.rowCount}</b>
          <span className="mx-1 text-ink/20">|</span>
          {((runResult.durationMs ?? 0) / 1000).toFixed(3)}s
        </span>
      </div>

      <ResultTable columns={runResult.columns ?? []} rows={runResult.rows ?? []} />

      <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 border px-3 py-2.5 text-[12px] text-body">
        <Info size={15} className="text-ink/35 shrink-0" />
        This is a preview of your result. Click &apos;Submit Final Answer&apos; to
        get full evaluation.
      </div>
    </>
  );
}

function StatRows({ rows }: { rows: [string, string][] }) {
  return (
    <div className="rounded-xl border divide-y divide-black/[0.06]">
      {rows.map(([k, v]) => (
        <div
          key={k}
          className="flex items-center justify-between px-3.5 py-2.5 text-[12.5px]"
        >
          <span className="text-body">{k}</span>
          <span className="font-semibold text-ink text-right">{v}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Main editor ──────────────────────────────────────────────── */
export default function SqlEditor() {
  const {
    query,
    setQuery,
    runQuery,
    runResult,
    runCount,
    maxRuns,
    previousRuns,
    format,
    clear,
    isRunning,
  } = usePractice() as PracticeCtx;

  const [tab, setTab] = useState("editor");
  const [fullscreen, setFullscreen] = useState(false);

  function handleRun() {
    const r = runQuery();
    if (!r?.capped) setTab("result");
  }

  const atCap = runCount >= maxRuns;

  const statRows: [string, string][] = runResult
    ? runResult.success
      ? [
          ["Status", "Success"],
          ["Rows returned", String(runResult.rowCount)],
          ["Columns", String(runResult.columns?.length ?? 0)],
          ["Execution time", `${((runResult.durationMs ?? 0) / 1000).toFixed(3)}s`],
          ["Runs used", `${runCount} / ${maxRuns}`],
        ]
      : [
          ["Status", "Failed"],
          ["Error", runResult.error ?? "Unknown error"],
          ["Runs used", `${runCount} / ${maxRuns}`],
        ]
    : [];

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-white shadow-card",
        fullscreen && "fixed inset-3 z-50"
      )}
    >
      {/* header */}
      <div className="flex items-center justify-between border-b px-4 h-12">
        <span className="flex items-center gap-2 text-[14px] font-bold">
          <SquareTerminal size={17} className="text-brand" /> SQL Editor
        </span>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2">
                <Database size={14} className="text-ink/50" /> {SESSION.database}
                <ChevronDown size={14} className="text-ink/40" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>{SESSION.database}</DropdownMenuItem>
              <DropdownMenuItem disabled>SalesDB (locked)</DropdownMenuItem>
              <DropdownMenuItem disabled>HR_DB (locked)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-ink/50"
            onClick={() => setFullscreen((f) => !f)}
            aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </Button>
        </div>
      </div>

      <Tabs
        value={tab}
        onValueChange={setTab}
        className="flex flex-1 flex-col gap-0"
      >
        <div className="border-b px-3 pt-2">
          <TabsList className="bg-transparent p-0 h-auto gap-4">
            {[
              ["editor", "Editor"],
              ["result", "Query Result"],
              ["stats", "Query Stats"],
              ["runs", "Previous Runs"],
            ].map(([v, label]) => (
              <TabsTrigger
                key={v}
                value={v}
                className="relative rounded-none border-0 bg-transparent px-0 pb-2 text-[13px] font-semibold text-ink/55 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-brand data-[state=active]:shadow-none after:absolute after:inset-x-0 after:-bottom-px after:h-[2.5px] after:rounded-full after:bg-transparent data-[state=active]:after:bg-brand"
              >
                {label}
                {v === "runs" && previousRuns.length > 0 && (
                  <span className="ml-1.5 text-[11px] text-ink/40">
                    {previousRuns.length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Editor: schema explorer ↔ code, resizable */}
        <TabsContent value="editor" className="m-0 overflow-hidden">
          <div className={cn(fullscreen ? "h-[calc(100vh-200px)]" : "h-[420px]")}>
            <ResizablePanelGroup orientation="horizontal">
              <ResizablePanel defaultSize={26} minSize={16} maxSize={44}>
                <SchemaExplorer />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={74}>
                <div className="flex h-full flex-col">
                  <div className="flex-1 overflow-hidden">
                    <CodeEditor value={query} onChange={setQuery} onRun={handleRun} />
                  </div>
                  {/* toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm" onClick={handleRun} disabled={atCap || isRunning} className="gap-2">
                        <Play size={13} fill="currentColor" strokeWidth={0} /> {isRunning ? "Running…" : "Run Query"}
                        {!isRunning && <span className="text-white/70 text-[11px]">Ctrl+Enter</span>}
                      </Button>
                      <Button variant="outline" size="sm" onClick={format} className="gap-2">
                        <AlignLeft size={15} /> Format
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clear}
                        className="gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={14} /> Clear
                      </Button>
                    </div>
                    <span className="flex items-center gap-1.5 text-[12.5px] text-body">
                      Runs:{" "}
                      <b className={atCap ? "text-rose-500" : "text-ink"}>
                        {runCount} / {maxRuns}
                      </b>
                      <Info size={14} className="text-ink/35" />
                    </span>
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </TabsContent>

        <TabsContent value="result" className="m-0 overflow-y-auto p-4">
          <QueryResultBody
            runResult={runResult}
            runCount={runCount}
            maxRuns={maxRuns}
            isRunning={isRunning}
          />
        </TabsContent>

        <TabsContent value="stats" className="m-0 overflow-y-auto p-4">
          {runResult ? <StatRows rows={statRows} /> : <EmptyResult />}
        </TabsContent>

        <TabsContent value="runs" className="m-0 overflow-y-auto p-4">
          {previousRuns.length === 0 ? (
            <p className="py-4 text-center text-[12.5px] text-body">No runs yet.</p>
          ) : (
            <div className="rounded-xl border divide-y divide-black/[0.06]">
              {previousRuns.map((r) => (
                <div
                  key={r.n}
                  className="flex items-center justify-between px-3.5 py-2.5 text-[12.5px]"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    {r.success ? (
                      <CircleCheck size={14} className="text-emerald-500" />
                    ) : (
                      <CircleAlert size={14} className="text-rose-500" />
                    )}
                    Run #{r.n}
                  </span>
                  <span className="text-body">
                    {r.success ? `${r.rowCount} rows` : "failed"}
                    <span className="mx-1.5 text-ink/20">|</span>
                    {(r.durationMs / 1000).toFixed(3)}s
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
