"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Item = { id: string; groups: string[]; node: ReactNode };

/** Service filter chips over server-rendered case study cards. */
export default function CaseStudyFilter({ filters, items }: { filters: { value: string; label: string }[]; items: Item[] }) {
  const [active, setActive] = useState("all");
  const shown = active === "all" ? items : items.filter((i) => i.groups.includes(active));
  const count = (v: string) => (v === "all" ? items.length : items.filter((i) => i.groups.includes(v)).length);

  return (
    <div>
      {filters.length > 1 && (
        <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter case studies by service">
          {[{ value: "all", label: "All work" }, ...filters].map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={active === f.value}
              onClick={() => setActive(f.value)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                active === f.value ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40",
              )}
            >
              {f.label}
              <span className={cn("rounded-full px-1.5 text-[11px]", active === f.value ? "bg-white/15" : "bg-paper text-muted")}>{count(f.value)}</span>
            </button>
          ))}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-live="polite">
        {shown.map((i) => (
          <div key={i.id} className="anim-pop flex [&>*]:w-full">{i.node}</div>
        ))}
      </div>
    </div>
  );
}
