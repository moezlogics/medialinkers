"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { api, Card, Field, Input, Select, Switch, Tabs } from "../ui";
import EditorBar from "../EditorBar";
import SectionsBuilder from "../SectionsBuilder";
import SeoPanel from "../SeoPanel";
import { useSaveShortcut } from "../useSaveShortcut";
import { sectionDefaults } from "@/lib/sections";
import type { PageDoc } from "@/lib/types";
import { slugify, stripHtml, uid } from "@/lib/utils";

const SCHEMA_TYPES = ["WebPage", "AboutPage", "ContactPage", "CollectionPage", "FAQPage", "ItemPage", "ProfilePage"].map((v) => ({ value: v, label: v }));

const blank = (): PageDoc => ({
  _id: "",
  title: "",
  slug: "",
  status: "draft",
  schemaType: "WebPage",
  showInSitemap: true,
  sections: [
    { uid: uid(), type: "pageHero", enabled: true, label: "", data: sectionDefaults("pageHero") },
    { uid: uid(), type: "richText", enabled: true, label: "", data: sectionDefaults("richText") },
    { uid: uid(), type: "cta", enabled: true, label: "", data: sectionDefaults("cta") },
  ],
  seo: {},
});

export default function PageEditor({ initial, titleTemplate }: { initial: PageDoc | null; titleTemplate: string }) {
  const router = useRouter();
  const [page, setPage] = useState<PageDoc>(initial || blank());
  const [saved, setSaved] = useState(JSON.stringify(initial || blank()));
  const [tab, setTab] = useState("sections");
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const isNew = !initial;
  const dirty = JSON.stringify(page) !== saved;
  const path = page.slug === "home" ? "/" : `/${page.slug}`;

  const set = <K extends keyof PageDoc>(k: K, v: PageDoc[K]) => setPage((p) => ({ ...p, [k]: v }));

  const save = useCallback(async () => {
    if (!page.title.trim()) return toast.error("Please add a page title");
    if (!page.slug.trim()) return toast.error("Please add a URL slug");
    setSaving(true);
    try {
      if (isNew) {
        const j = await api<{ item: PageDoc }>("/api/admin/c/pages", { method: "POST", body: page });
        toast.success("Page created");
        setSaved(JSON.stringify(page));
        router.replace(`/newlogin/pages/${j.item._id}`);
      } else {
        const j = await api<{ item: PageDoc }>(`/api/admin/c/pages/${page._id}`, { method: "PUT", body: page });
        setPage(j.item);
        setSaved(JSON.stringify(j.item));
        toast.success("Saved — live on the site");
      }
    } catch {
      /* toast shown by api() */
    } finally {
      setSaving(false);
    }
  }, [page, isNew, router]);

  useSaveShortcut(save, dirty);

  const content = useMemo(
    () => page.sections.filter((s) => s.enabled).map((s) => [s.data?.title, s.data?.text, s.data?.content, ...(s.data?.items || []).map((i: Record<string, string>) => `${i.title || i.q || ""} ${i.text || i.a || ""}`)].join(" ")).join(" "),
    [page.sections],
  );
  const firstText = stripHtml(page.sections.find((s) => s.data?.text)?.data?.text || "");

  return (
    <div>
      <EditorBar backHref="/newlogin/pages" backLabel="Pages" title={page.title} saving={saving} dirty={dirty} onSave={save} viewHref={page.status === "published" ? path : undefined} previewHref={path} isNew={isNew} />
      <div className="mb-4">
        <Tabs tabs={[{ id: "sections", label: `Sections (${page.sections.length})` }, { id: "seo", label: "SEO & meta" }, { id: "settings", label: "Page settings" }]} active={tab} onChange={setTab} />
      </div>

      {tab === "sections" && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <SectionsBuilder sections={page.sections} onChange={(s) => set("sections", s)} />
          <div className="space-y-4 xl:sticky xl:top-36 xl:self-start">
            <Card title="Publish">
              <div className="space-y-3">
                <Select value={page.status} onChange={(e) => set("status", e.target.value as PageDoc["status"])} options={[{ value: "published", label: "Published" }, { value: "draft", label: "Draft (hidden)" }]} />
                <p className="text-xs text-ink/50">URL: <a href={path} target="_blank" className="font-mono text-ink hover:text-accent">{path}</a></p>
              </div>
            </Card>
            <Card title="Tips">
              <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-ink/60">
                <li>The first section on the page becomes the main <b>H1</b> heading.</li>
                <li>Wrap a word in <b>*stars*</b> to highlight it in brand colour.</li>
                <li>FAQ sections add Google FAQ rich results automatically.</li>
                <li>Drag sections by the handle or use the arrows to reorder.</li>
                <li>Press <b>Ctrl + S</b> to save.</li>
              </ul>
            </Card>
          </div>
        </div>
      )}

      {tab === "seo" && (
        <Card>
          <SeoPanel seo={page.seo || {}} onChange={(seo) => set("seo", seo)} fallbackTitle={page.title} fallbackDescription={firstText} path={path} content={content} titleTemplate={titleTemplate} />
        </Card>
      )}

      {tab === "settings" && (
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Page title" help="Shown in the admin, breadcrumbs and as the default meta title.">
              <Input
                value={page.title}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!slugTouched && !page.system) set("slug", slugify(e.target.value));
                }}
              />
            </Field>
            <Field label="URL slug" help={page.system ? "System page — the URL is fixed." : "Lowercase words joined by hyphens, e.g. our-team"}>
              <Input
                value={page.slug}
                disabled={page.system}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9/-]/g, "-"));
                }}
              />
            </Field>
            <Field label="Schema type" help="Tells Google what kind of page this is.">
              <Select value={page.schemaType || "WebPage"} onChange={(e) => set("schemaType", e.target.value)} options={SCHEMA_TYPES} />
            </Field>
            <Field label="Status">
              <Select value={page.status} onChange={(e) => set("status", e.target.value as PageDoc["status"])} options={[{ value: "published", label: "Published" }, { value: "draft", label: "Draft (hidden)" }]} />
            </Field>
            <div className="sm:col-span-2">
              <Switch checked={page.showInSitemap !== false} onChange={(v) => set("showInSitemap", v)} label="Include in sitemap.xml" help="Turn off for thank-you pages or private landing pages." />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
