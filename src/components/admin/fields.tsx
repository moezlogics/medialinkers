"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ChevronDown, ChevronUp, Copy, GripVertical, Plus, Search, Trash2, X } from "lucide-react";
import { Button, Field, Input, Modal, Select, Switch, Textarea, inputCls } from "./ui";
import { ImageField } from "./MediaLibrary";
import { ICONS, Icon } from "@/lib/icons";
import type { Field as FieldDef } from "@/lib/sections";
import { cn } from "@/lib/utils";

const RichEditor = dynamic(() => import("./RichEditor"), { ssr: false, loading: () => <div className="h-[300px] animate-pulse rounded-xl bg-paper" /> });
export { RichEditor };

/* eslint-disable @typescript-eslint/no-explicit-any */

export function IconPicker({ value, onChange, label }: { value?: string; onChange: (v: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const groups: ["brand" | "ui" | "industry", string][] = [["brand", "Brands"], ["ui", "General"], ["industry", "Industries"]];
  return (
    <Field label={label}>
      <button type="button" onClick={() => setOpen(true)} className={cn(inputCls, "flex items-center gap-2 text-left")}>
        <span className="grid size-7 place-items-center rounded-lg bg-paper"><Icon name={value} className="size-4" /></span>
        <span className="flex-1 truncate">{(value && ICONS[value]?.label) || "Choose icon"}</span>
        <ChevronDown className="size-4 text-ink/40" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Choose an icon" size="lg">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
          <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search icons…" className="pl-9" />
        </div>
        {groups.map(([g, name]) => {
          const list = Object.entries(ICONS).filter(([k, v]) => v.group === g && (k + v.label).toLowerCase().includes(q.toLowerCase()));
          if (!list.length) return null;
          return (
            <div key={g} className="mb-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink/45">{name}</p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                {list.map(([k, v]) => (
                  <button
                    type="button"
                    key={k}
                    onClick={() => {
                      onChange(k);
                      setOpen(false);
                    }}
                    className={cn("flex flex-col items-center gap-1 rounded-xl border p-2 text-[10px] leading-tight hover:border-accent", value === k ? "border-accent bg-accent/5" : "border-line")}
                  >
                    <v.icon className="size-5" />
                    <span className="line-clamp-1">{v.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </Modal>
    </Field>
  );
}

export function TagsInput({ value = [], onChange, label, help, placeholder = "Type and press Enter" }: { value?: string[]; onChange: (v: string[]) => void; label?: string; help?: string; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const parts = draft.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) onChange([...value, ...parts.filter((p) => !value.includes(p))]);
    setDraft("");
  };
  return (
    <Field label={label} help={help}>
      <div className={cn(inputCls, "flex flex-wrap items-center gap-1.5 py-2")}>
        {value.map((t, i) => (
          <span key={t + i} className="inline-flex items-center gap-1 rounded-lg bg-ink/5 px-2 py-1 text-xs font-medium">
            {t}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${t}`}><X className="size-3" /></button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={add}
          placeholder={value.length ? "" : placeholder}
          className="min-w-[120px] flex-1 bg-transparent text-sm focus:outline-none"
        />
      </div>
    </Field>
  );
}

export function LinkField({ value, onChange, label }: { value?: { label?: string; href?: string }; onChange: (v: { label: string; href: string }) => void; label?: string }) {
  const v = { label: value?.label || "", href: value?.href || "" };
  return (
    <Field label={label}>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input value={v.label} onChange={(e) => onChange({ ...v, label: e.target.value })} placeholder="Button text" />
        <Input value={v.href} onChange={(e) => onChange({ ...v, href: e.target.value })} placeholder="/contact-us or https://…" />
      </div>
    </Field>
  );
}

/** Repeatable list of items (stats, steps, FAQs…) with add / remove / reorder. */
export function ListField({ value = [], onChange, fields, label, itemLabel = "Item" }: { value?: any[]; onChange: (v: any[]) => void; fields: FieldDef[]; label?: string; itemLabel?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpen(j);
  };
  const blank = () => Object.fromEntries(fields.map((f) => [f.name, f.type === "list" || f.type === "tags" ? [] : f.type === "toggle" ? false : ""]));
  const titleOf = (it: any) => it?.title || it?.name || it?.q || it?.value || it?.label || "";
  return (
    <Field label={label}>
      <div className="space-y-2">
        {value.map((it, i) => (
          <div key={i} className="rounded-xl border border-line bg-paper/40">
            <div className="flex items-center gap-1 px-2 py-1.5">
              <GripVertical className="size-4 shrink-0 text-ink/25" />
              <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left text-sm">
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-white text-[11px] font-bold text-ink/50">{i + 1}</span>
                {it?.icon && <Icon name={it.icon} className="size-4 shrink-0" />}
                <span className="truncate font-medium">{titleOf(it) || <i className="text-ink/40">{itemLabel} {i + 1}</i>}</span>
              </button>
              <button type="button" onClick={() => move(i, -1)} className="grid size-7 place-items-center rounded-md hover:bg-white" aria-label="Move up"><ChevronUp className="size-4" /></button>
              <button type="button" onClick={() => move(i, 1)} className="grid size-7 place-items-center rounded-md hover:bg-white" aria-label="Move down"><ChevronDown className="size-4" /></button>
              <button type="button" onClick={() => onChange([...value.slice(0, i + 1), structuredClone(it), ...value.slice(i + 1)])} className="grid size-7 place-items-center rounded-md hover:bg-white" aria-label="Duplicate"><Copy className="size-3.5" /></button>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="grid size-7 place-items-center rounded-md text-red-600 hover:bg-white" aria-label="Remove"><Trash2 className="size-3.5" /></button>
            </div>
            {open === i && (
              <div className="grid gap-3 border-t border-line bg-white p-3 sm:grid-cols-2">
                {fields.map((f) => (
                  <div key={f.name} className={cn((f.type === "textarea" || f.type === "richtext" || f.type === "list" || f.full) && "sm:col-span-2")}>
                    <FieldInput field={f} value={it?.[f.name]} onChange={(v) => onChange(value.map((x, j) => (j === i ? { ...x, [f.name]: v } : x)))} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            onChange([...value, blank()]);
            setOpen(value.length);
          }}
        >
          <Plus className="size-4" /> Add {itemLabel.toLowerCase()}
        </Button>
      </div>
    </Field>
  );
}

/** Renders the right input for a field definition. */
export function FieldInput({ field: f, value, onChange }: { field: FieldDef; value: any; onChange: (v: any) => void }) {
  switch (f.type) {
    case "textarea":
      return <Field label={f.label} help={f.help}><Textarea value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} rows={4} /></Field>;
    case "richtext":
      return <Field label={f.label} help={f.help}><RichEditor value={value || ""} onChange={onChange} /></Field>;
    case "image":
      return <ImageField label={f.label} help={f.help} value={value} onChange={onChange} />;
    case "number":
      return <Field label={f.label} help={f.help}><Input type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} /></Field>;
    case "toggle":
      return <div className="pt-6"><Switch checked={!!value} onChange={onChange} label={f.label} help={f.help} /></div>;
    case "select":
      return <Field label={f.label} help={f.help}><Select value={value ?? ""} onChange={(e) => onChange(e.target.value)} options={f.options || []} /></Field>;
    case "icon":
      return <IconPicker label={f.label} value={value} onChange={onChange} />;
    case "tags":
      return <TagsInput label={f.label} help={f.help} value={value || []} onChange={onChange} />;
    case "link":
      return <LinkField label={f.label} value={value} onChange={onChange} />;
    case "list":
      return <ListField label={f.label} value={value || []} onChange={onChange} fields={f.fields || []} itemLabel={f.itemLabel} />;
    case "url":
    case "text":
    default:
      return <Field label={f.label} help={f.help}><Input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} /></Field>;
  }
}

export function FieldGrid({ fields, data, onChange }: { fields: FieldDef[]; data: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <div key={f.name} className={cn((f.type === "textarea" || f.type === "richtext" || f.type === "list" || f.full) && "sm:col-span-2")}>
          <FieldInput field={f} value={data?.[f.name]} onChange={(v) => onChange({ ...data, [f.name]: v })} />
        </div>
      ))}
    </div>
  );
}
