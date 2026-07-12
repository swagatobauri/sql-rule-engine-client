"use client";

import { useMemo, useState, type SetStateAction } from "react";
import { ChevronDown, SearchX } from "lucide-react";
import { useProblems } from "@/lib/api/problems";
import PracticeTabs from "./PracticeTabs";
import FilterBar from "./FilterBar";
import QuestionCard, { type Question } from "./QuestionCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 6;

interface Filters {
  difficulty: string;
  dataset: string;
}

type QuestionId = Question["id"];

// Client island: owns the active-tab + filter state and renders the filtered grid.
export default function QuestionExplorer() {
  const { data: problems, isLoading, isError } = useProblems();
  const [activeTab, setActiveTab] = useState("All");
  const [filters, setFilters] = useState<Filters>({
    difficulty: "All",
    dataset: "All",
  });
  const [search, setSearch] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = useState<Set<QuestionId>>(() => new Set());
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Map the public API projection onto the card's shape. `difficulty` is
  // optional on the API but required by the card, so default it.
  const questions = useMemo<Question[]>(
    () =>
      (problems ?? []).map((p) => ({
        id: p.id,
        title: p.title,
        schemaName: p.schemaName,
        difficulty: p.difficulty ?? "Unknown",
        concepts: p.concepts,
      })),
    [problems],
  );

  function toggleSave(id: QuestionId) {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Get unique schemas for filter options
  const schemaOptions = useMemo(() => {
    if (!Array.isArray(questions)) return ["All"];
    const schemas = new Set(questions.map((q: Question) => q.schemaName));
    return ["All", ...Array.from(schemas).sort()];
  }, [questions]);

  const filtered = useMemo(() => {
    if (!Array.isArray(questions)) return [];
    const q = search.trim().toLowerCase();
    return questions.filter((item: Question) => {
      if (filters.difficulty !== "All" && item.difficulty !== filters.difficulty) return false;
      if (filters.dataset !== "All" && item.schemaName !== filters.dataset) return false;
      if (savedOnly && !saved.has(item.id)) return false;
      if (q && !(`${item.title} ${item.schemaName} ${(item.concepts || []).join(" ")}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [filters, search, savedOnly, saved, questions]);

  // Reset paging whenever the active filter set changes.
  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  function changeTab(tab: string) {
    setActiveTab(tab);
    setVisible(PAGE_SIZE);
  }
  function changeFilters(updater: SetStateAction<Filters>) {
    setFilters(updater);
    setVisible(PAGE_SIZE);
  }

  if (isLoading) {
    return (
      <div className="mt-6 flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-white border-black/[0.07] shadow-card py-14 text-center gap-0">
        <SearchX size={28} className="text-ink/30" />
        <p className="mt-3 text-[14px] font-semibold text-ink">Couldn&apos;t load questions</p>
        <p className="mt-1 text-[12.5px] text-body">Check that the API server is running, then refresh.</p>
      </Card>
    );
  }

  return (
    <div className="mt-6" id="questions">
      <PracticeTabs active={activeTab} onChange={changeTab} />
      <FilterBar
        filters={filters}
        onFilterChange={(key: string, value: string) => changeFilters((f) => ({ ...f, [key]: value }))}
        search={search}
        onSearchChange={(v: string) => {
          setSearch(v);
          setVisible(PAGE_SIZE);
        }}
        savedOnly={savedOnly}
        onToggleSavedOnly={() => {
          setSavedOnly((v) => !v);
          setVisible(PAGE_SIZE);
        }}
        savedCount={saved.size}
        resultCount={filtered.length}
        schemaOptions={schemaOptions}
      />

      {shown.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {shown.map((q: Question) => (
            <QuestionCard
              key={q.id}
              question={q}
              saved={saved.has(q.id)}
              onToggleSave={() => toggleSave(q.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="mt-5 flex flex-col items-center justify-center rounded-2xl bg-white border-black/[0.07] shadow-card py-14 text-center gap-0">
          <SearchX size={28} className="text-ink/30" />
          <p className="mt-3 text-[14px] font-semibold text-ink">No questions match your filters</p>
          <p className="mt-1 text-[12.5px] text-body">Try clearing the search or switching tabs.</p>
        </Card>
      )}

      {hasMore && (
        <div className="mt-5 flex justify-center">
          <Button
            variant="ghost"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="rounded-lg bg-white border border-black/10 px-5 has-[>svg]:px-5 h-9 text-[13px] font-semibold text-ink/80 hover:bg-black/[0.02] hover:text-ink/80 transition-none"
          >
            Load More Questions <ChevronDown size={15} strokeWidth={2} className="size-[15px]" />
          </Button>
        </div>
      )}
    </div>
  );
}
