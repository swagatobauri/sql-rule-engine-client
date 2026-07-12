"use client";

import { type ChangeEvent } from "react";
import { Bookmark, Check, ChevronDown, Search } from "lucide-react";
import { DIFFICULTY_OPTIONS } from "@/data/questions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DropdownProps {
  name: string;
  prefix: string;
  value: string;
  options: string[];
  onSelect: (name: string, value: string) => void;
}

// One filter dropdown. Label shows "prefix: value"; opening reveals selectable options.
function Dropdown({ name, prefix, value, options, onSelect }: DropdownProps) {
  const active = value !== "All";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "group h-9 gap-2 rounded-lg px-3 text-[13px] font-medium hover:bg-black/[0.02]",
            active
              ? "border-brand/30 bg-brand-soft text-brand hover:bg-brand-soft"
              : "border-black/10 bg-white text-ink/80"
          )}
        >
          {prefix}: {value}
          <ChevronDown
            className={cn(
              "size-[15px] transition-transform group-data-[state=open]:rotate-180",
              active ? "text-brand/60" : "text-ink/45"
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[170px] p-1.5 shadow-soft">
        {options.map((opt: string) => (
          <DropdownMenuItem
            key={opt}
            onClick={() => onSelect(name, opt)}
            className={cn(
              "flex h-8 items-center justify-between gap-3 rounded-lg px-2.5 text-[13px]",
              opt === value ? "font-semibold text-brand" : "text-ink/80"
            )}
          >
            {opt}
            {opt === value && <Check size={14} className="text-brand" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface FilterBarFilters {
  difficulty: string;
  dataset: string;
}

interface FilterBarProps {
  filters: FilterBarFilters;
  onFilterChange: (key: string, value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  savedOnly: boolean;
  onToggleSavedOnly: () => void;
  savedCount: number;
  resultCount: number;
  schemaOptions?: string[];
}

export default function FilterBar({
  filters,
  onFilterChange,
  search,
  onSearchChange,
  savedOnly,
  onToggleSavedOnly,
  savedCount,
  resultCount,
  schemaOptions = ["All"],
}: FilterBarProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2.5">
      <Dropdown name="difficulty" prefix="Difficulty" value={filters.difficulty} options={DIFFICULTY_OPTIONS} onSelect={onFilterChange} />
      <Dropdown name="dataset" prefix="Schema" value={filters.dataset} options={schemaOptions} onSelect={onFilterChange} />

      <Button
        variant="outline"
        onClick={onToggleSavedOnly}
        className={cn(
          "h-9 gap-2 rounded-lg px-3 text-[13px] font-medium hover:bg-black/[0.02]",
          savedOnly
            ? "border-brand/30 bg-brand-soft text-brand hover:bg-brand-soft"
            : "border-black/10 bg-white text-ink/80"
        )}
      >
        <Bookmark className="size-[15px]" fill={savedOnly ? "currentColor" : "none"} /> Saved
        {savedCount > 0 && (
          <span className={cn("text-[11px] font-bold", savedOnly ? "text-brand" : "text-ink/50")}>
            {savedCount}
          </span>
        )}
      </Button>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden sm:block text-[12px] text-body whitespace-nowrap">
          {resultCount} {resultCount === 1 ? "question" : "questions"}
        </span>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 z-10" />
          <Input
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            placeholder="Search questions..."
            className="h-9 w-[230px] max-w-[55vw] rounded-lg border-black/10 bg-white pl-9 pr-3 text-[13px] shadow-none placeholder:text-ink/40 focus-visible:ring-2 focus-visible:ring-brand/30"
          />
        </div>
      </div>
    </div>
  );
}
