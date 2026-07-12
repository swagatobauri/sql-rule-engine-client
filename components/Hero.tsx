import Link from "next/link";
import { BookOpen, Play } from "lucide-react";
import { HeroIllustration } from "./Illustrations";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1fr_0.92fr] gap-8 items-center pt-9 pb-2">
      <div>
        <p className="text-[12.5px] font-bold tracking-[0.12em] text-brand mb-3">
          SQL INTERVIEW PRACTICE ARENA
        </p>
        <h1 className="text-[44px] leading-[1.08] font-extrabold tracking-[-0.02em] text-ink">
          Practice SQL the way interviews actually test it.
        </h1>
        <p className="mt-4 text-[15.5px] leading-relaxed text-body max-w-[480px]">
          Write queries under time pressure, explain your logic, handle edge cases, and get
          feedback on more than just the final output.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Button
            asChild
            className="h-[46px] gap-2 rounded-xl px-5 text-[14.5px] font-semibold shadow-soft"
          >
            <Link href="/practice">
              <Play size={16} fill="currentColor" strokeWidth={0} /> Start Timed SQL Mock
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-[46px] gap-2 rounded-xl border-black/10 bg-white px-5 text-[14.5px] font-semibold text-ink hover:bg-black/[0.02]"
          >
            <a href="#solved-examples">
              <BookOpen className="size-[17px]" /> View Solved SQL Examples
            </a>
          </Button>
        </div>
      </div>

      <div className="h-[300px]">
        <HeroIllustration />
      </div>
    </section>
  );
}
