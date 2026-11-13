"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api, Card, Field, Input, Select, Switch, Tabs, Textarea } from "../ui";
import EditorBar from "../EditorBar";
import SeoPanel from "../SeoPanel";
import { IconPicker, ListField, RichEditor, TagsInput } from "../fields";
import { ImageField } from "../MediaLibrary";
import { useSaveShortcut } from "../useSaveShortcut";
import type { Field as FieldDef } from "@/lib/sections";
import type { ServiceDoc } from "@/lib/types";
import { slugify } from "@/lib/utils";

const ITEM_FIELDS: FieldDef[] = [
  { name: "icon", label: "Icon", type: "icon" },
  { name: "title", label: "Title", type: "text" },
  { name: "text", label: "Text", type: "textarea" },
];
const STAT_FIELDS: FieldDef[] = [
  { name: "value", label: "Value (e.g. +120%)", type: "text" },
  { name: "label", label: "Label", type: "text" },
];
const FAQ_FIELDS: FieldDef[] = [
  { name: "q", label: "Question", type: "text", full: true },
  { name: "a", label: "Answer", type: "textarea" },
];
const PACKAGE_FIELDS: FieldDef[] = [
  { name: "name", label: "Package name", type: "text" },
  { name: "perfectFor", label: "Perfect for", type: "text" },
  { name: "currency", label: "Currency symbol", type: "text", placeholder: "$ or Rs." },
  { name: "period", label: "Period", type: "text", placeholder: "/Month" },
  { name: "oldPrice", label: "Old price (crossed out)", type: "text" },
  { name: "price", label: "Price", type: "text" },
  { name: "features", label: "Features (press Enter after each)", type: "tags", full: true },
  { name: "goal", label: "Goal line", type: "text", full: true },
  { name: "ctaLabel", label: "Button text", type: "text" },
  { name: "featured", label: "Highlight as best seller", type: "toggle" },
];

const blank = (): ServiceDoc => ({
  _id: "", parent: null, title: "", shortTitle: "", slug: "", icon: "sparkles", excerpt: "", heroEyebrow: "", heroTitle: "", heroText: "", ctaLabel: "Request Free Consultation",
  whyTitle: "", content: "", featuresTitle: "", features: [], process: [], statsTitle: "Results that *matter*", stats: [], ctaTitle: "", ctaText: "",
  packagesTitle: "", packages: [], faqs: [], order: 10, showInHero: true, status: "draft", seo: {},
});

export default function ServiceEditor({ initial, titleTemplate }: { initial: ServiceDoc | null; titleTemplate: string }) {
  const router = useRouter();
  const [s, setS] = useState<ServiceDoc>(initial || blank());
  const [saved, setSaved] = useState(JSON.stringify(initial || blank()));
  const [tab, setTab] = useState("basics");
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [mains, setMains] = useState<{ _id: string; title: string; slug: string }[]>([]);
  const isNew = !initial;
  const dirty = JSON.stringify(s) !== saved;
  const parent = mains.find((m) => m._id === s.parent) || null;
  const publicPath = parent ? `/${parent.slug}/${s.slug}` : `/${s.slug}`;

  useEffect(() => {
    api<{ items: (ServiceDoc & { parent?: string | null })[] }>("/api/admin/c/services?limit=200", { silent: true })
      .then((j) => setMains(j.items.filter((x) => !x.parent && x._id !== initial?._id)))
      .catch(() => {});
  }, [initial?._id]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (k: keyof ServiceDoc, v: any) => setS((p) => ({ ...p, [k]: v }));

  const save = useCallback(async () => {
    if (!s.title.trim()) return toast.error("Please add a service title");
    setSaving(true);
    try {
      if (isNew) {
        const j = await api<{ item: ServiceDoc }>("/api/admin/c/services", { method: "POST", body: s });
        setSaved(JSON.stringify(s));
        toast.success("Service created");
        router.replace(`/newlogin/services/${j.item._id}`);
      } else {
        const j = await api<{ item: ServiceDoc }>(`/api/admin/c/services/${s._id}`, { method: "PUT", body: s });
        setS(j.item);
        setSaved(JSON.stringify(j.item));
        toast.success("Saved — live on the site");
      }
    } catch {
    } finally {
      setSaving(false);
    }
  }, [s, isNew, router]);
  useSaveShortcut(save, dirty);

  const tabs = [
    { id: "basics", label: "Basics" },
    { id: "hero", label: "Hero" },
    { id: "content", label: "Content" },
    { id: "features", label: `Sub-services (${s.features.length})` },
    { id: "process", label: "Process & results" },
    { id: "packages", label: `Packages (${s.packages.length})` },
    { id: "faqs", label: `FAQs (${s.faqs.length})` },
    { id: "seo", label: "SEO" },
  ];

  return (
    <div>
      <EditorBar backHref="/newlogin/services" backLabel="Services" title={s.title} saving={saving} dirty={dirty} onSave={save} viewHref={s.status === "published" ? publicPath : undefined} previewHref={publicPath} isNew={isNew} />
      <div className="mb-4"><Tabs tabs={tabs} active={tab} onChange={setTab} /></div>

      {tab === "basics" && (
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Service title">
              <Input value={s.title} onChange={(e) => { set("title", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} placeholder="Search Engine Optimization (SEO)" />
            </Field>
            <Field label="Short name" help="Used in menus and the round hero icons.">
              <Input value={s.shortTitle || ""} onChange={(e) => set("shortTitle", e.target.value)} placeholder="SEO" />
            </Field>
            <Field label="Service type" help={s.parent ? "Sub-service pages appear under the main service, in the menu and on its page." : "Main services get their own menu column and can have sub-services."}>
              <Select
                value={s.parent || ""}
                onChange={(e) => set("parent", e.target.value || null)}
                options={[{ value: "", label: "Main service" }, ...mains.map((m) => ({ value: m._id, label: `Sub-service of: ${m.title}` }))]}
              />
            </Field>
            <Field label="URL slug" help={`Page URL: ${publicPath} — changing it breaks old links (add a redirect).`}>
              <Input value={s.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} />
            </Field>
            <IconPicker label="Icon" value={s.icon} onChange={(v) => set("icon", v)} />
            <Field label="Short description" help="Shown on service cards and in the menu." className="sm:col-span-2">
              <Textarea value={s.excerpt || ""} onChange={(e) => set("excerpt", e.target.value)} />
            </Field>
            <Field label="Display order" help="Lower numbers appear first.">
              <Input type="number" value={s.order} onChange={(e) => set("order", Number(e.target.value))} />
            </Field>
            <Field label="Status">
              <Select value={s.status} onChange={(e) => set("status", e.target.value)} options={[{ value: "published", label: "Published" }, { value: "draft", label: "Draft (hidden)" }]} />
            </Field>
            {!s.parent && (
              <div className="sm:col-span-2">
                <Switch checked={s.showInHero !== false} onChange={(v) => set("showInHero", v)} label="Show as a round icon in the home hero" />
              </div>
            )}
            <div className="sm:col-span-2">
              <ImageField label="Service image (optional)" help="Used for social sharing when set." value={s.image} onChange={(v) => set("image", v)} />
            </div>
          </div>
        </Card>
      )}

      {tab === "hero" && (
        <Card>
          <div className="grid gap-4">
            <Field label="Small label (eyebrow)"><Input value={s.heroEyebrow || ""} onChange={(e) => set("heroEyebrow", e.target.value)} /></Field>
            <Field label="Main heading (H1)" help="Wrap a word in *stars* to highlight it."><Input value={s.heroTitle || ""} onChange={(e) => set("heroTitle", e.target.value)} /></Field>
            <Field label="Intro text"><Textarea rows={4} value={s.heroText || ""} onChange={(e) => set("heroText", e.target.value)} /></Field>
            <Field label="Main button text"><Input value={s.ctaLabel || ""} onChange={(e) => set("ctaLabel", e.target.value)} /></Field>
          </div>
        </Card>
      )}

      {tab === "content" && (
        <Card>
          <div className="grid gap-4">
            <Field label="Section heading" help="e.g. Why your business needs SEO"><Input value={s.whyTitle || ""} onChange={(e) => set("whyTitle", e.target.value)} /></Field>
            <Field label="Content"><RichEditor value={s.content || ""} onChange={(v) => set("content", v)} /></Field>
            <TagsInput label="Highlights (optional)" value={s.highlights || []} onChange={(v) => set("highlights", v)} />
          </div>
        </Card>
      )}

      {tab === "features" && (
        <Card>
          <div className="grid gap-4">
            <Field label="Heading"><Input value={s.featuresTitle || ""} onChange={(e) => set("featuresTitle", e.target.value)} placeholder="Our SEO *services*" /></Field>
            <ListField label="Sub-services" itemLabel="Service" value={s.features} onChange={(v) => set("features", v)} fields={ITEM_FIELDS} />
          </div>
        </Card>
      )}

      {tab === "process" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="How we work">
            <ListField itemLabel="Step" value={s.process} onChange={(v) => set("process", v)} fields={ITEM_FIELDS} />
          </Card>
          <Card title="Results / stats">
            <div className="space-y-4">
              <Field label="Heading"><Input value={s.statsTitle || ""} onChange={(e) => set("statsTitle", e.target.value)} /></Field>
              <ListField itemLabel="Stat" value={s.stats} onChange={(v) => set("stats", v)} fields={STAT_FIELDS} />
            </div>
          </Card>
          <Card title="Free audit box" className="lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Heading"><Input value={s.ctaTitle || ""} onChange={(e) => set("ctaTitle", e.target.value)} /></Field>
              <Field label="Text"><Input value={s.ctaText || ""} onChange={(e) => set("ctaText", e.target.value)} /></Field>
            </div>
          </Card>
        </div>
      )}

      {tab === "packages" && (
        <Card description="Prices also appear on the Pricing page and in Google as Offer schema.">
          <div className="grid gap-4">
            <Field label="Heading"><Input value={s.packagesTitle || ""} onChange={(e) => set("packagesTitle", e.target.value)} placeholder="SEO *packages*" /></Field>
            <ListField itemLabel="Package" value={s.packages} onChange={(v) => set("packages", v)} fields={PACKAGE_FIELDS} />
          </div>
        </Card>
      )}

      {tab === "faqs" && (
        <Card description="FAQs show on the page and as FAQ rich results in Google.">
          <ListField itemLabel="Question" value={s.faqs} onChange={(v) => set("faqs", v)} fields={FAQ_FIELDS} />
        </Card>
      )}

      {tab === "seo" && (
        <Card>
          <SeoPanel
            seo={s.seo || {}}
            onChange={(v) => set("seo", v)}
            fallbackTitle={s.title}
            fallbackDescription={s.excerpt}
            path={publicPath}
            content={[s.heroText, s.content, ...s.features.map((f) => `${f.title} ${f.text}`), ...s.faqs.map((f) => `${f.q} ${f.a}`)].join(" ")}
            titleTemplate={titleTemplate}
          />
        </Card>
      )}
    </div>
  );
}
