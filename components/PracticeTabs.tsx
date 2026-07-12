"use client";

import { QUESTION_TABS } from "@/data/questions";

interface PracticeTabsProps {
  active: string;
  onChange: (tab: string) => void;
}

export default function PracticeTabs({ active, onChange }: PracticeTabsProps) {
  return (
    <div className="border-b border-black/[0.07] flex items-center gap-6 overflow-x-auto">
      {QUESTION_TABS.map((tab: string) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`relative whitespace-nowrap pb-3 text-[14px] font-semibold ${
            active === tab ? "text-brand" : "text-ink/55 hover:text-ink"
          }`}
        >
          {tab}
          {active === tab && (
            <span className="absolute -bottom-px left-0 right-0 h-[2.5px] rounded-full bg-brand" />
          )}
        </button>
      ))}
    </div>
  );
}
