"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Eye, EyeOff, GripVertical, Plus, Trash2 } from "lucide-react";
import { Button, Field, Input, Modal } from "./ui";
import { FieldGrid } from "./fields";
import { SECTION_DEFS, SECTION_MAP, sectionDefaults } from "@/lib/sections";
import type { Section } from "@/lib/types";
import { cn, plainHighlight, uid } from "@/lib/utils";

const GROUPS = ["Hero", "Content", "Social proof", "Conversion", "Dynamic", "Advanced"] as const;

function preview(s: Section) {
  const d = s.data || {};
  return plainHighlight(d.title || d.text || d.items?.[0]?.title || d.items?.[0] || "");
}

export default function SectionsBuilder({ sections, onChange }: { sections: Section[]; onChange: (s: Section[]) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState<{ at: number } | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const update = (i: number, patch: Partial<Section>) => onChange(sections.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= sections.length || from === to) return;
    const next = [...sections];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onChange(next);
  };
  const add = (type: string, at: number) => {
    const s: Section = { uid: uid(), type, enabled: true, label: "", data: sectionDefaults(type) };
    const next = [...sections];
    next.splice(at, 0, s);
    onChange(next);
    setOpen(s.uid);
    setAdding(null);
  };

  return (
    <div className="space-y-2">
      {sections.length === 0 && (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center text-sm text-ink/55">This page has no sections yet. Add your first one 👇</div>
      )}
      {sections.map((s, i) => {
        const def = SECTION_MAP[s.type];
        const isOpen = open === s.uid;
        return (
          <div
            key={s.uid}
            onDragOver={(e) => {
              if (dragFrom === null) return;
              e.preventDefault();
              setDragOver(i);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragFrom !== null) move(dragFrom, i);
              setDragFrom(null);
              setDragOver(null);
            }}
            className={cn(
              "rounded-2xl border bg-white transition-all",
              isOpen ? "border-ink/25 shadow-sm" : "border-line",
              !s.enabled && "opacity-60",
              dragOver === i && dragFrom !== i && "ring-2 ring-accent",
            )}
          >
            <div className="flex items-center gap-1 p-2 sm:gap-2">
              <span
                draggable
                onDragStart={() => setDragFrom(i)}
                onDragEnd={() => { setDragFrom(null); setDragOver(null); }}
                className="hidden cursor-grab items-center text-ink/30 active:cursor-grabbing sm:flex"
                title="Drag to reorder"
              >
                <GripVertical className="size-5" />
              </span>
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-paper text-xs font-bold text-ink/50">{i + 1}</span>
              <button type="button" onClick={() => setOpen(isOpen ? null : s.uid)} className="min-w-0 flex-1 text-left">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold">{s.label || def?.label || s.type}</span>
                  {!s.enabled && <span className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] font-semibold text-ink/50">Hidden</span>}
                </span>
                <span className="block truncate text-xs text-ink/45">{s.label ? def?.label + " · " : ""}{preview(s) || def?.description}</span>
              </button>
              <div className="flex items-center">
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="grid size-8 place-items-center rounded-lg hover:bg-ink/5 disabled:opacity-25" aria-label="Move up"><ChevronUp className="size-4" /></button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === sections.length - 1} className="grid size-8 place-items-center rounded-lg hover:bg-ink/5 disabled:opacity-25" aria-label="Move down"><ChevronDown className="size-4" /></button>
                <button type="button" onClick={() => update(i, { enabled: !s.enabled })} className="grid size-8 place-items-center rounded-lg hover:bg-ink/5" title={s.enabled ? "Hide section" : "Show section"} aria-label={s.enabled ? "Hide section" : "Show section"}>
                  {s.enabled ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const copy = { ...structuredClone(s), uid: uid() };
                    const next = [...sections];
                    next.splice(i + 1, 0, copy);
                    onChange(next);
                  }}
                  className="hidden size-8 place-items-center rounded-lg hover:bg-ink/5 sm:grid"
                  title="Duplicate"
                  aria-label="Duplicate"
                >
                  <Copy className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => confirm(`Remove the "${def?.label || s.type}" section?`) && onChange(sections.filter((_, j) => j !== i))}
                  className="grid size-8 place-items-center rounded-lg text-ink/40 hover:bg-red-50 hover:text-red-600"
                  title="Delete"
                  aria-label="Delete section"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            {isOpen && def && (
              <div className="space-y-4 border-t border-line p-4">
                <Field label="Admin label (optional)" help="Only shown here, to help you find this section.">
                  <Input value={s.label || ""} onChange={(e) => update(i, { label: e.target.value })} placeholder={def.label} />
                </Field>
                <FieldGrid fields={def.fields} data={s.data} onChange={(data) => update(i, { data })} />
                <div className="flex justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setAdding({ at: i + 1 })}><Plus className="size-4" /> Insert section below</Button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => setAdding({ at: sections.length })}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 bg-white/60 py-4 text-sm font-semibold text-ink/60 transition-colors hover:border-accent hover:text-accent"
      >
        <Plus className="size-5" /> Add section
      </button>

      <Modal open={!!adding} onClose={() => setAdding(null)} title="Add a section" size="lg">
        {GROUPS.map((g) => (
          <div key={g} className="mb-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink/45">{g}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {SECTION_DEFS.filter((d) => d.group === g).map((d) => (
                <button
                  type="button"
                  key={d.type}
                  onClick={() => adding && add(d.type, adding.at)}
                  className="rounded-xl border border-line p-3 text-left transition-colors hover:border-accent hover:bg-accent/5"
                >
                  <span className="block text-sm font-semibold">{d.label}</span>
                  <span className="block text-xs text-ink/55">{d.description}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </Modal>
    </div>
  );
}
