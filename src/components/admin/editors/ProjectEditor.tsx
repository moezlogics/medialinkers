"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { api, Button, Card, Field, Input, Select, Switch, Tabs, Textarea } from "../ui";
import EditorBar from "../EditorBar";
import SeoPanel from "../SeoPanel";
import { ListField, RichEditor, TagsInput } from "../fields";
import { ImageField, MediaPicker } from "../MediaLibrary";
import { useSaveShortcut } from "../useSaveShortcut";
import TrendChart from "@/components/case-studies/TrendChart";
import type { ProjectDoc } from "@/lib/types";
import { cn, slugify } from "@/lib/utils";

type P = ProjectDoc & { order: number };
type Svc = { _id: string; title: string; parent?: string | null };

const blank = (): P => ({
  _id: "", title: "", slug: "", client: "", confidential: false, industry: "", location: "", period: "", duration: "", serviceRefs: [], services: [],
  website: "", excerpt: "", coverImage: "", logo: "", accent: "", results: [], trend: { label: "", points: [] }, challenge: "", approach: [], content: "",
  outcome: "", proofs: [], quote: { text: "", name: "", role: "" }, gallery: [], featured: false, status: "draft", seo: {}, order: 0,
});

const SWATCHES = ["#d4ff3a", "#5eead4", "#a5b4fc", "#fdba74", "#93c5fd", "#f9a8d4", "#86efac"];

export default function ProjectEditor({ initial, titleTemplate }: { initial: (ProjectDoc & { order?: number }) | null; titleTemplate: string }) {
  const router = useRouter();
  const start: P = { ...blank(), ...(initial || {}), trend: { label: "", points: [], ...(initial?.trend || {}) }, quote: { text: "", name: "", role: "", ...(initial?.quote || {}) } } as P;
  const [p, setP] = useState<P>(start);
  const [saved, setSaved] = useState(JSON.stringify(start));
  const [tab, setTab] = useState("details");
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [svcs, setSvcs] = useState<Svc[]>([]);
  const [pointsText, setPointsText] = useState((start.trend?.points || []).join(", "));
  const isNew = !initial;
  const dirty = JSON.stringify(p) !== saved;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (k: string, v: any) => setP((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    api<{ items: Svc[] }>("/api/admin/c/services?limit=200", { silent: true })
      .then((j) => setSvcs(j.items))
      .catch(() => {});
  }, []);

  const save = useCallback(async () => {
    if (!p.title.trim()) return toast.error("Please add a title");
    setSaving(true);
    try {
      if (isNew) {
        const j = await api<{ item: ProjectDoc }>("/api/admin/c/projects", { method: "POST", body: p });
        setSaved(JSON.stringify(p));
        toast.success("Case study created");
        router.replace(`/newlogin/projects/${j.item._id}`);
      } else {
        const j = await api<{ item: ProjectDoc }>(`/api/admin/c/projects/${p._id}`, { method: "PUT", body: p });
        const next = { ...blank(), ...j.item } as P;
        setP(next);
        setSaved(JSON.stringify(next));
        toast.success("Saved");
      }
    } catch {
    } finally {
      setSaving(false);
    }
  }, [p, isNew, router]);
  useSaveShortcut(save, dirty);

  const mains = svcs.filter((s) => !s.parent);
  const refs = new Set((p.serviceRefs || []).map(String));
  const toggleRef = (id: string) => set("serviceRefs", refs.has(id) ? [...refs].filter((x) => x !== id) : [...refs, id]);
  const proofs = p.proofs || [];
  const moveProof = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= proofs.length) return;
    const next = [...proofs];
    [next[i], next[j]] = [next[j], next[i]];
    set("proofs", next);
  };

  return (
    <div>
      <EditorBar backHref="/newlogin/projects" backLabel="Case studies" title={p.title} saving={saving} dirty={dirty} onSave={save} viewHref={p.status === "published" ? `/case-studies/${p.slug}` : undefined} previewHref={`/case-studies/${p.slug}`} isNew={isNew} />
      <div className="mb-4">
        <Tabs
          tabs={[
            { id: "details", label: "Details" },
            { id: "results", label: `Results & chart (${p.results?.length || 0})` },
            { id: "story", label: "Story" },
            { id: "proof", label: `Proof (${proofs.length})` },
            { id: "seo", label: "SEO" },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {tab === "details" && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" className="sm:col-span-2">
                <Input value={p.title} onChange={(e) => { set("title", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} placeholder="How we grew X’s organic traffic by 300%" />
              </Field>
              <Field label="URL slug" help={`/case-studies/${p.slug || "case-study"}`}><Input value={p.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} /></Field>
              <Field label="Status"><Select value={p.status} onChange={(e) => set("status", e.target.value)} options={[{ value: "published", label: "Published" }, { value: "draft", label: "Draft (hidden)" }]} /></Field>
              <Field label="Client (shown publicly)" help={p.confidential ? "Describe the client without the brand, e.g. “Online grocery store”." : undefined}><Input value={p.client || ""} onChange={(e) => set("client", e.target.value)} /></Field>
              <Field label="Website"><Input value={p.website || ""} onChange={(e) => set("website", e.target.value)} placeholder="https://" disabled={p.confidential} /></Field>
              <Field label="Industry"><Input value={p.industry || ""} onChange={(e) => set("industry", e.target.value)} placeholder="Real estate" /></Field>
              <Field label="Market / location"><Input value={p.location || ""} onChange={(e) => set("location", e.target.value)} placeholder="Pakistan" /></Field>
              <Field label="Period"><Input value={p.period || ""} onChange={(e) => set("period", e.target.value)} placeholder="Jan – Nov 2026" /></Field>
              <Field label="Duration"><Input value={p.duration || ""} onChange={(e) => set("duration", e.target.value)} placeholder="10 months" /></Field>
              <Field label="Summary" className="sm:col-span-2" help="One or two sentences shown on cards and in Google."><Textarea value={p.excerpt || ""} onChange={(e) => set("excerpt", e.target.value)} /></Field>
              <div className="sm:col-span-2"><ImageField label="Social share image (optional)" help="Used when the page is shared. The first proof screenshot is used if empty." value={p.coverImage} onChange={(v) => set("coverImage", v)} /></div>
            </div>
          </Card>
          <div className="space-y-4">
            <Card title="Visibility">
              <div className="space-y-4">
                <Switch checked={!!p.featured} onChange={(v) => set("featured", v)} label="Featured" help="Featured case studies appear on the home page." />
                <Switch checked={!!p.confidential} onChange={(v) => set("confidential", v)} label="Keep client confidential" help="Hides the website link and shows a “Confidential” badge." />
                <Field label="Display order" help="Lower numbers appear first."><Input type="number" value={p.order} onChange={(e) => set("order", Number(e.target.value))} /></Field>
              </div>
            </Card>
            <Card title="Services used" description="The case study appears on these service pages (and their main service).">
              {mains.length === 0 ? (
                <p className="text-sm text-ink/50">Loading services…</p>
              ) : (
                <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                  {mains.map((m) => (
                    <div key={m._id}>
                      <label className="flex items-center gap-2 text-sm font-semibold">
                        <input type="checkbox" checked={refs.has(m._id)} onChange={() => toggleRef(m._id)} className="size-4 accent-[var(--accent)]" /> {m.title}
                      </label>
                      <div className="mt-1.5 flex flex-wrap gap-1.5 pl-6">
                        {svcs.filter((c) => String(c.parent) === m._id).map((c) => (
                          <button key={c._id} type="button" onClick={() => toggleRef(c._id)} className={cn("rounded-full border px-2.5 py-1 text-xs transition-colors", refs.has(c._id) ? "border-ink bg-ink text-white" : "border-line hover:border-ink/40")}>
                            {c.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4"><TagsInput label="Extra tags (optional)" value={p.services || []} onChange={(v) => set("services", v)} help="Only shown when no service is ticked." /></div>
            </Card>
          </div>
        </div>
      )}

      {tab === "results" && (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card title="Key results" description="The first result is the big headline number. Add before/after values to show a comparison bar.">
            <ListField
              itemLabel="Result"
              value={p.results || []}
              onChange={(v) => set("results", v)}
              fields={[
                { name: "value", label: "Big value (e.g. +355%)", type: "text" },
                { name: "label", label: "Label (e.g. organic clicks, year over year)", type: "text" },
                { name: "before", label: "Before (optional, e.g. 1.08K)", type: "text" },
                { name: "after", label: "After (optional, e.g. 4.91K)", type: "text" },
              ]}
            />
          </Card>
          <Card title="Growth chart" description="Numbers that trace the growth curve, oldest first — e.g. clicks per week from Search Console.">
            <div className="space-y-4">
              <Field label="Chart caption"><Input value={p.trend?.label || ""} onChange={(e) => set("trend", { ...p.trend, label: e.target.value })} placeholder="Daily organic clicks · Google Search Console" /></Field>
              <Field label="Data points" help="Comma separated, 6–40 numbers.">
                <Textarea
                  value={pointsText}
                  onChange={(e) => {
                    setPointsText(e.target.value);
                    set("trend", { ...p.trend, points: e.target.value.split(/[\s,]+/).map(Number).filter((n) => Number.isFinite(n)) });
                  }}
                  placeholder="0, 2, 5, 12, 30, 60, 120, 210, 300"
                />
              </Field>
              <Field label="Chart colour">
                <div className="flex flex-wrap items-center gap-2">
                  {SWATCHES.map((c) => (
                    <button key={c} type="button" onClick={() => set("accent", c)} className={cn("size-8 rounded-full ring-offset-2", p.accent === c && "ring-2 ring-ink")} style={{ background: c }} aria-label={`Colour ${c}`} />
                  ))}
                  <Input value={p.accent || ""} onChange={(e) => set("accent", e.target.value)} placeholder="#d4ff3a" className="!w-32" />
                </div>
              </Field>
              <div className="overflow-hidden rounded-2xl bg-ink p-4 pb-0 text-white">
                <p className="text-xs text-white/50">Preview</p>
                {(p.trend?.points?.length || 0) > 1 ? <TrendChart points={p.trend!.points!} color={p.accent || SWATCHES[0]} /> : <p className="py-10 text-center text-sm text-white/40">Add at least two numbers</p>}
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === "story" && (
        <div className="space-y-4">
          <Card title="The challenge"><Textarea rows={4} value={p.challenge || ""} onChange={(e) => set("challenge", e.target.value)} placeholder="Where the client started and what was holding them back…" /></Card>
          <Card title="What we did" description="Short steps, shown as numbered cards.">
            <ListField itemLabel="Step" value={p.approach || []} onChange={(v) => set("approach", v)} fields={[{ name: "title", label: "Title", type: "text" }, { name: "text", label: "Text", type: "textarea" }, { name: "icon", label: "Icon", type: "icon" }]} />
          </Card>
          <Card title="Full story (optional)">
            <RichEditor value={p.content || ""} onChange={(v) => set("content", v)} minHeight={280} placeholder="Extra detail, timeline, learnings…" />
          </Card>
          <Card title="The outcome"><Textarea rows={3} value={p.outcome || ""} onChange={(e) => set("outcome", e.target.value)} placeholder="One strong closing sentence about the result." /></Card>
          <Card title="Client quote (optional)">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Quote" className="sm:col-span-2"><Textarea value={p.quote?.text || ""} onChange={(e) => set("quote", { ...p.quote, text: e.target.value })} /></Field>
              <Field label="Name"><Input value={p.quote?.name || ""} onChange={(e) => set("quote", { ...p.quote, name: e.target.value })} /></Field>
              <Field label="Role / company"><Input value={p.quote?.role || ""} onChange={(e) => set("quote", { ...p.quote, role: e.target.value })} /></Field>
            </div>
          </Card>
        </div>
      )}

      {tab === "proof" && (
        <Card title="Proof screenshots" description="Search Console, Analytics or sales dashboards. Add a caption so visitors know what they are looking at.">
          <div className="space-y-3">
            {proofs.map((pr, i) => (
              <div key={pr.image + i} className="grid gap-3 rounded-2xl border border-line p-3 sm:grid-cols-[180px_1fr_auto] sm:items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pr.image} alt="" className="aspect-[16/7] w-full rounded-xl bg-paper object-cover" />
                <Input value={pr.caption || ""} onChange={(e) => set("proofs", proofs.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))} placeholder="Google Search Console — last 6 months" />
                <div className="flex gap-1">
                  <button type="button" onClick={() => moveProof(i, -1)} className="grid size-9 place-items-center rounded-lg hover:bg-ink/5" aria-label="Move up"><ArrowUp className="size-4" /></button>
                  <button type="button" onClick={() => moveProof(i, 1)} className="grid size-9 place-items-center rounded-lg hover:bg-ink/5" aria-label="Move down"><ArrowDown className="size-4" /></button>
                  <button type="button" onClick={() => set("proofs", proofs.filter((_, j) => j !== i))} className="grid size-9 place-items-center rounded-lg text-red-600 hover:bg-red-50" aria-label="Remove"><X className="size-4" /></button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setPicker(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 py-6 text-sm text-ink/50 hover:border-accent hover:text-accent">
              <ImagePlus className="size-5" /> Add screenshot
            </button>
          </div>
          <MediaPicker open={picker} onClose={() => setPicker(false)} onSelect={(m) => set("proofs", [...proofs, { image: m.url, caption: m.alt || "", width: m.width || undefined, height: m.height || undefined }])} />
          <div className="mt-4"><Button variant="outline" size="sm" onClick={() => setPicker(true)}>Choose from library</Button></div>
        </Card>
      )}

      {tab === "seo" && (
        <Card>
          <SeoPanel seo={p.seo || {}} onChange={(v) => set("seo", v)} fallbackTitle={`${p.title} — Case Study`} fallbackDescription={p.excerpt} path={`/case-studies/${p.slug}`} content={[p.challenge, p.outcome, p.content].join(" ")} titleTemplate={titleTemplate} />
        </Card>
      )}
    </div>
  );
}
