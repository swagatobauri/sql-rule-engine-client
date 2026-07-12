import Link from "next/link";
import { Bookmark, Play } from "lucide-react";
import { DIFFICULTY_COLOR } from "@/lib/styles";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Question {
  id: string | number;
  difficulty: string;
  title: string;
  schemaName: string;
  concepts?: string[];
}

interface QuestionCardProps {
  question: Question;
  saved?: boolean;
  onToggleSave?: () => void;
}

export default function QuestionCard({ question, saved = false, onToggleSave }: QuestionCardProps) {
  const { id, difficulty, title, schemaName, concepts } = question;

  return (
    <Card className="rounded-2xl bg-white border-black/[0.07] shadow-card p-4 gap-0">
      <div className="flex items-center justify-between">
        <Badge
          className={cn(
            "border-0 rounded-md px-2 py-1 text-[10.5px] font-bold tracking-wide",
            DIFFICULTY_COLOR[difficulty as keyof typeof DIFFICULTY_COLOR]
          )}
        >
          {difficulty.toUpperCase()}
        </Badge>
      </div>

      <h3 className="mt-3 text-[15.5px] font-bold leading-snug text-ink min-h-[44px]">{title}</h3>

      <p className="mt-3 text-[12.5px] text-body">
        Schema: <span className="text-ink/70 font-medium">{schemaName}</span>
      </p>

      {concepts && concepts.length > 0 && (
        <p className="mt-2 text-[12.5px] text-body">
          Concepts: <span className="text-ink/70 font-medium">{concepts.join(", ")}</span>
        </p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <Button
          asChild
          className="flex-1 rounded-lg bg-brand hover:bg-brand-dark text-white text-[13px] font-semibold h-[38px] transition-colors"
        >
          <Link href={`/practice?q=${id}`}>
            <Play size={13} fill="currentColor" strokeWidth={0} className="size-[13px]" /> Start Practice
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSave}
          aria-label={saved ? "Remove from saved" : "Save question"}
          aria-pressed={saved}
          className={cn(
            "size-[38px] rounded-lg border transition-colors",
            saved
              ? "border-brand/30 bg-brand-soft text-brand hover:bg-brand-soft hover:text-brand"
              : "border-black/10 text-ink/50 hover:bg-black/[0.02] hover:text-ink/50"
          )}
        >
          <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
        </Button>
      </div>
    </Card>
  );
}
