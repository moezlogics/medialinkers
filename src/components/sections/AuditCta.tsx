import { Check, FileSearch, Gauge, Link2, ListChecks, MapPin, Search } from "lucide-react";
import Highlight from "@/components/site/Highlight";
import AuditRequestForm from "@/components/site/AuditRequestForm";
import { Reveal } from "@/components/site/Reveal";
import Scene3D from "@/components/three/Scene3D";
import type { SectionProps } from "./types";

const COVERS = [
  { icon: Gauge, title: "Technical health & speed", text: "Core Web Vitals, crawling, indexing" },
  { icon: FileSearch, title: "On-page & content", text: "Titles, headings, thin pages, gaps" },
  { icon: Search, title: "Keywords & competitors", text: "Where you rank and who beats you" },
  { icon: Link2, title: "Backlink profile", text: "Authority, toxic links, quick wins" },
  { icon: MapPin, title: "Local & AI search", text: "Google Maps, AI Overviews, ChatGPT" },
];

export default function AuditCta({ data }: Omit<SectionProps, "ctx">) {
  const points: string[] = (data.points || []).filter(Boolean);
  return (
    <section className="section" id="audit">
      <div className="container-x">
        <Reveal className="grain relative isolate overflow-hidden rounded-[2rem] bg-ink p-6 text-white sm:p-10 lg:p-14">
          <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-full opacity-70 lg:w-3/5" aria-hidden="true">
            <Scene3D variant="dark" theme="audit" />
          </div>
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.35fr_1fr]">
            <div>
              {data.eyebrow && <p className="eyebrow mb-3 text-white/60">{data.eyebrow}</p>}
              <h2 className="h-display text-4xl sm:text-5xl lg:text-6xl">
                <Highlight text={data.title} tone="lime" />
              </h2>
              {data.text && <p className="mt-4 max-w-xl text-white/70 md:text-lg">{data.text}</p>}
              <AuditRequestForm tone="dark" className="mt-7 max-w-2xl" buttonLabel={data.buttonLabel || "Get my free audit"} placeholder={data.placeholder || "yourwebsite.com"} />
              {points.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70">
                  {points.map((p) => (
                    <li key={p} className="flex items-center gap-1.5"><Check className="size-4 text-lime" />{p}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="relative rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-md sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 font-display text-lg font-bold"><ListChecks className="size-5 text-lime" /> Your audit covers</p>
                <span className="rounded-full bg-lime px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-ink">24h</span>
              </div>
              <ul className="mt-4 space-y-2">
                {COVERS.map((c, i) => (
                  <li key={c.title} className="audit-row flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5" style={{ animationDelay: `${i * 0.12}s` }}>
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10"><c.icon className="size-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{c.title}</span>
                      <span className="block truncate text-xs text-white/50">{c.text}</span>
                    </span>
                    <span className="audit-tick grid size-5 place-items-center rounded-full bg-lime text-ink" style={{ animationDelay: `${0.4 + i * 0.15}s` }}><Check className="size-3" strokeWidth={3} /></span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-white/50">Reviewed by a senior SEO specialist — not an automated scan — and sent to your inbox as a clear, prioritised plan.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
