"use client";

import { useState } from "react";
import { CircleCheck, Send } from "lucide-react";
import { usePractice } from "./PracticeProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

function CharCount({ value, max }: { value: number; max: number }) {
  return (
    <div className="text-right text-[11px] text-ink/40 mt-1">
      {value} / {max}
    </div>
  );
}

export default function AnswerForm() {
  const { submit, submitted, evaluation, isSubmitting, submitError, debrief } = usePractice();
  const [logic, setLogic] = useState("");
  const [edge, setEdge] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (logic.trim().length < 10) {
      setError("Please explain your logic before submitting (at least a sentence).");
      return;
    }
    setError("");
    submit({ logic, edge });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  }

  if (submitted && evaluation) {
    return (
      <Card className="bg-white rounded-2xl border border-black/[0.07] shadow-card! py-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <CircleCheck size={18} />
            <span className="text-[14px] font-bold">Answer submitted</span>
          </div>
          <p className="mt-2 text-[12.5px] text-body leading-relaxed">
            Your query and explanation were evaluated. You scored{" "}
            <b className="text-ink">{evaluation.total} / 100</b>
            {debrief && <> — <b className="text-ink">{debrief.readiness}</b></>}. See the
            breakdown in the rubric above.
          </p>

          {debrief ? (
            <div className="mt-3 space-y-3">
              <p className="text-[12.5px] text-body leading-relaxed">{debrief.feedbackSummary}</p>

              {debrief.strengths.length > 0 && (
                <div>
                  <p className="text-[12px] font-bold text-emerald-600">Strengths</p>
                  <ul className="mt-1 list-disc pl-4 text-[12px] text-body space-y-0.5">
                    {debrief.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {debrief.mistakes.length > 0 && (
                <div>
                  <p className="text-[12px] font-bold text-rose-500">To improve</p>
                  <ul className="mt-1 list-disc pl-4 text-[12px] text-body space-y-0.5">
                    {debrief.mistakes.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-lg bg-brand-soft px-3 py-2.5 text-[12px] text-body">
                <b className="text-ink">Next step:</b> {debrief.overallNextStep}
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-lg bg-brand-soft px-3 py-2.5 text-[12px] text-body">
              Review the per-criterion scores, then move to the next question to keep practicing.
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-2xl border border-black/[0.07] shadow-card! py-0" onKeyDown={onKeyDown}>
      <CardContent className="p-4">
        <Label className="block text-[13px] font-bold leading-normal">
          Explain your logic <span className="text-rose-500">*</span>
        </Label>
        <textarea
          value={logic}
          onChange={(e) => {
            setLogic(e.target.value.slice(0, 2000));
            if (error) setError("");
          }}
          placeholder="Explain your joins, filters, grouping and assumptions."
          className={`mt-2 w-full h-[78px] resize-none rounded-lg border p-2.5 text-[12.5px] placeholder:text-ink/35 focus:outline-none focus:ring-2 ${
            error ? "border-rose-300 focus:ring-rose-200" : "border-black/10 focus:ring-brand/25"
          }`}
        />
        <CharCount value={logic.length} max={2000} />

        <Label className="mt-3 block text-[13px] font-bold leading-normal">
          Edge cases considered <span className="text-body font-medium">(optional)</span>
        </Label>
        <textarea
          value={edge}
          onChange={(e) => setEdge(e.target.value.slice(0, 1000))}
          placeholder="List the edge cases you considered, such as duplicates, nulls, date range boundaries, etc."
          className="mt-2 w-full h-[72px] resize-none rounded-lg border border-black/10 p-2.5 text-[12.5px] placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-brand/25"
        />
        <CharCount value={edge.length} max={1000} />

        {error && <p className="mt-1 text-[11.5px] font-medium text-rose-500">{error}</p>}
        {submitError && (
          <p className="mt-1 text-[11.5px] font-medium text-rose-500" role="alert">
            {submitError}
          </p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg bg-brand hover:bg-brand-dark text-white h-11 text-[14px] font-bold transition-colors disabled:opacity-60"
        >
          <Send size={16} /> {isSubmitting ? "Submitting…" : "Submit Final Answer"}
          {!isSubmitting && <span className="text-white/70 font-medium text-[12px]">Ctrl+Enter</span>}
        </Button>
        <p className="mt-2 text-center text-[11px] text-body">
          You can run the query multiple times before submitting.
        </p>
      </CardContent>
    </Card>
  );
}
