"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { id: string; groups: string[]; region?: string; node: ReactNode };
type Option = { value: string; label: string };

const PAGE = 12;

function Chips({ options, active, onChange, count, label, icon }: { options: Option[]; active: string; onChange: (v: string) => void; count: (v: string) => number; label: string; icon?: ReactNode }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label={label}>
      {options.map((f) => {
        const n = count(f.value);
        return (
          <button
            key={f.value}
            type="button"
            aria-pressed={active === f.value}
            disabled={!n}
            onClick={() => onChange(f.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
              active === f.value ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40",
            )}
          >
            {icon && f.value !== "all" && icon}
            {f.label}
            <span className={cn("rounded-full px-1.5 text-[11px]", active === f.value ? "bg-white/15" : "bg-paper text-muted")}>{n}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Service + region filters and "show more" over server-rendered case study cards. */
export default function CaseStudyFilter({ filters, regions = [], items }: { filters: Option[]; regions?: string[]; items: Item[] }) {
  const [service, setService] = useState("all");
  const [region, setRegion] = useState("all");
  const [limit, setLimit] = useState(PAGE);

  const match = (i: Item, s = service, r = region) => (s === "all" || i.groups.includes(s)) && (r === "all" || i.region === r);
  const shown = items.filter((i) => match(i));
  const visible = shown.slice(0, limit);

  return (
    <div>
      <div className="mb-6 space-y-3">
        {filters.length > 1 && (
          <Chips
            label="Filter case studies by service"
            options={[{ value: "all", label: "All work" }, ...filters]}
            active={service}
            onChange={(v) => {
              setService(v);
              setLimit(PAGE);
            }}
            count={(v) => items.filter((i) => match(i, v, region)).length}
          />
        )}
        {regions.length > 1 && (
          <Chips
            label="Filter case studies by country"
            icon={<MapPin className="size-3.5" />}
            options={[{ value: "all", label: "All countries" }, ...regions.map((r) => ({ value: r, label: r }))]}
            active={region}
            onChange={(v) => {
              setRegion(v);
              setLimit(PAGE);
            }}
            count={(v) => items.filter((i) => match(i, service, v)).length}
          />
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-live="polite">
        {visible.map((i) => (
          <div key={i.id} className="anim-pop flex [&>*]:w-full">{i.node}</div>
        ))}
      </div>
      {shown.length > visible.length && (
        <div className="mt-8 text-center">
          <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="btn btn-dark">
            Show more case studies <span className="opacity-60">({shown.length - visible.length})</span> <ChevronDown className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
