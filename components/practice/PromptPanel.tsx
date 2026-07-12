"use client";

import { useState } from "react";
import { Clock, FileText, NotebookPen, type LucideIcon } from "lucide-react";
import SchemaTable from "./SchemaTable";
import { SESSION, EXPECTED_OUTPUT, SCHEMA } from "@/data/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

function MiniTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div className="mt-1.5 rounded-xl border border-black/[0.08] overflow-hidden">
      <Table className="text-[11.5px]">
        <TableHeader>
          <TableRow className="bg-[#FAFAFC] text-body border-black/[0.05] hover:bg-[#FAFAFC]">
            {columns.map((c) => (
              <TableHead
                key={c}
                className="text-left font-semibold px-3 py-1.5 first:pl-3 h-auto text-body"
              >
                {c}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="font-mono text-ink/80">
          {rows.map((r, i) => (
            <TableRow
              key={i}
              className={`border-black/[0.05] hover:bg-transparent ${r[0] === "..." ? "text-ink/40" : ""}`}
            >
              {r.map((cell, j) => (
                <TableCell key={j} className="px-3 py-1.5">
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

function QuestionTab() {
  const [sub, setSub] = useState("Schema");

  return (
    <>
      <div className="flex items-center gap-2 text-[11px]">
        <Badge
          variant="secondary"
          className="rounded-md border-0 bg-violet-100 text-brand font-bold px-2 py-1 tracking-wide text-[11px]"
        >
          {SESSION.tag}
        </Badge>
        <span className="flex items-center gap-1 font-semibold text-body">
          <span className="text-[8px] text-amber-500">●</span>
          {SESSION.difficulty}
        </span>
        <span className="flex items-center gap-1 text-body">
          <Clock size={12} />
          {SESSION.time} min
        </span>
      </div>

      <h2 className="mt-3 text-[18px] font-extrabold leading-snug">{SESSION.title}</h2>
      <p className="mt-2 text-[12.5px] text-body leading-relaxed">{SESSION.description}</p>

      <p className="mt-4 text-[12.5px] font-bold text-ink">Expected Output</p>
      <MiniTable columns={EXPECTED_OUTPUT.columns} rows={EXPECTED_OUTPUT.rows} />

      <p className="mt-4 text-[12.5px] font-bold text-ink">Business Context</p>
      <p className="mt-1 text-[12.5px] text-body leading-relaxed">{SESSION.businessContext}</p>

      <div className="mt-4 flex gap-5 border-b border-black/[0.07]">
        {["Schema", "Sample Data"].map((s) => (
          <Button
            key={s}
            variant="ghost"
            onClick={() => setSub(s)}
            className={`relative h-auto rounded-none px-0 py-0 pb-2 text-[13px] font-semibold hover:bg-transparent ${
              sub === s ? "text-brand hover:text-brand" : "text-ink/55 hover:text-ink/55"
            }`}
          >
            {s}
            {sub === s && (
              <span className="absolute -bottom-px left-0 right-0 h-[2.5px] rounded-full bg-brand" />
            )}
          </Button>
        ))}
      </div>

      <div className="mt-3 space-y-3">
        {SCHEMA.map((t) => (
          <SchemaTable key={t.name} table={t} />
        ))}
      </div>
    </>
  );
}

export default function PromptPanel() {
  const [tab, setTab] = useState("Question");
  const TABS: [string, LucideIcon][] = [
    ["Question", FileText],
    ["Notes", NotebookPen],
  ];

  return (
    <Card className="bg-white rounded-2xl border border-black/[0.07] shadow-card! flex flex-col overflow-hidden gap-0 py-0">
      <div className="flex border-b border-black/[0.07]">
        {TABS.map(([t, Icon]) => (
          <Button
            key={t}
            variant="ghost"
            onClick={() => setTab(t)}
            className={`relative flex items-center gap-2 h-auto rounded-none px-5 py-3 has-[>svg]:px-5 text-[13.5px] font-semibold hover:bg-transparent ${
              tab === t ? "text-brand hover:text-brand" : "text-ink/55 hover:text-ink/55"
            }`}
          >
            <Icon size={15} className="size-[15px]" /> {t}
            {tab === t && (
              <span className="absolute bottom-0 left-4 right-4 h-[2.5px] rounded-full bg-brand" />
            )}
          </Button>
        ))}
      </div>

      <CardContent className="p-4">
        {tab === "Question" ? (
          <QuestionTab />
        ) : (
          <p className="text-[12.5px] text-body">
            Jot down your approach, edge cases and reminders here. Notes are private and never
            evaluated.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
