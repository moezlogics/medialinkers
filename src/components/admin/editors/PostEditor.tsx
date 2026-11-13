"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { api, Button, Card, Field, Input, Select, Switch, Tabs, Textarea, CharCounter } from "../ui";
import EditorBar from "../EditorBar";
import SeoPanel from "../SeoPanel";
import { ListField, RichEditor, TagsInput } from "../fields";
import { ImageField } from "../MediaLibrary";
import { useSaveShortcut } from "../useSaveShortcut";
import type { Faq, Seo } from "@/lib/types";
import { slugify } from "@/lib/utils";

type Post = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  coverAlt: string;
  category: string | null;
  tags: string[];
  authorName: string;
  status: "published" | "draft";
  featured: boolean;
  publishedAt: string;
  faqs: Faq[];
  seo: Seo;
};

const blank = (): Post => ({
  _id: "", title: "", slug: "", excerpt: "", content: "", coverImage: "", coverAlt: "", category: null, tags: [], authorName: "",
  status: "draft", featured: false, publishedAt: new Date().toISOString(), faqs: [], seo: {},
});

/** ISO date → value for <input type="datetime-local"> in the browser's timezone */
function toLocalInput(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

export default function PostEditor({ initial, titleTemplate }: { initial: Post | null; titleTemplate: string }) {
  const router = useRouter();
  const start = initial ? { ...blank(), ...initial, category: initial.category ? String(initial.category) : null } : blank();
  const [p, setP] = useState<Post>(start);
  const [saved, setSaved] = useState(JSON.stringify(start));
  const [tab, setTab] = useState("content");
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [cats, setCats] = useState<{ _id: string; name: string }[]>([]);
  const [newCat, setNewCat] = useState("");
  const isNew = !initial;
  const dirty = JSON.stringify(p) !== saved;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (k: keyof Post, v: any) => setP((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    api<{ items: { _id: string; name: string }[] }>("/api/admin/c/categories?limit=200", { silent: true }).then((j) => setCats(j.items)).catch(() => {});
  }, []);

  const scheduled = p.status === "published" && new Date(p.publishedAt) > new Date();

  const save = useCallback(async () => {
    if (!p.title.trim()) return toast.error("Please add a title");
    setSaving(true);
    try {
      if (isNew) {
        const j = await api<{ item: Post }>("/api/admin/c/posts", { method: "POST", body: p });
        setSaved(JSON.stringify(p));
        toast.success("Post created");
        router.replace(`/newlogin/posts/${j.item._id}`);
      } else {
        const j = await api<{ item: Post }>(`/api/admin/c/posts/${p._id}`, { method: "PUT", body: p });
        const next = { ...blank(), ...j.item, category: j.item.category ? String(j.item.category) : null };
        setP(next);
        setSaved(JSON.stringify(next));
        toast.success(p.status === "published" ? (scheduled ? "Saved — scheduled" : "Saved — live on the site") : "Draft saved");
      }
    } catch {
    } finally {
      setSaving(false);
    }
  }, [p, isNew, router, scheduled]);
  useSaveShortcut(save, dirty);

  async function addCategory() {
    if (!newCat.trim()) return;
    const j = await api<{ item: { _id: string; name: string } }>("/api/admin/c/categories", { method: "POST", body: { name: newCat.trim(), slug: slugify(newCat) } });
    setCats((c) => [...c, j.item]);
    set("category", j.item._id);
    setNewCat("");
    toast.success("Category added");
  }

  const content = useMemo(() => p.content + " " + p.faqs.map((f) => `${f.q} ${f.a}`).join(" "), [p.content, p.faqs]);

  return (
    <div>
      <EditorBar backHref="/newlogin/posts" backLabel="Blog posts" title={p.title} saving={saving} dirty={dirty} onSave={save} viewHref={p.status === "published" && !scheduled ? `/blog/${p.slug}` : undefined} previewHref={`/blog/${p.slug}`} isNew={isNew} />
      <div className="mb-4"><Tabs tabs={[{ id: "content", label: "Content" }, { id: "faqs", label: `FAQs (${p.faqs.length})` }, { id: "seo", label: "SEO & meta" }]} active={tab} onChange={setTab} /></div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          {tab === "content" && (
            <Card>
              <div className="space-y-4">
                <Field label="Title">
                  <Input
                    value={p.title}
                    onChange={(e) => {
                      set("title", e.target.value);
                      if (!slugTouched) set("slug", slugify(e.target.value));
                    }}
                    className="!py-3 !text-lg font-semibold"
                    placeholder="Write a clear, keyword-rich title…"
                  />
                </Field>
                <Field label="URL slug" help={`/blog/${p.slug || "your-post"}`}>
                  <Input value={p.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} />
                </Field>
                <Field label="Excerpt" counter={<CharCounter value={p.excerpt} min={70} max={200} />} help="Short summary shown on blog cards and used as the default meta description.">
                  <Textarea value={p.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
                </Field>
                <Field label="Content">
                  <RichEditor value={p.content} onChange={(v) => set("content", v)} minHeight={420} placeholder="Start writing your article… use H2/H3 headings — they build the table of contents automatically." />
                </Field>
              </div>
            </Card>
          )}
          {tab === "faqs" && (
            <Card description="Questions shown at the end of the post, with FAQ schema for Google.">
              <ListField itemLabel="Question" value={p.faqs} onChange={(v) => set("faqs", v)} fields={[{ name: "q", label: "Question", type: "text", full: true }, { name: "a", label: "Answer", type: "textarea" }]} />
            </Card>
          )}
          {tab === "seo" && (
            <Card>
              <SeoPanel seo={p.seo} onChange={(v) => set("seo", v)} fallbackTitle={p.title} fallbackDescription={p.excerpt} path={`/blog/${p.slug}`} content={content} titleTemplate={titleTemplate} />
            </Card>
          )}
        </div>

        <div className="space-y-4 xl:sticky xl:top-36 xl:self-start">
          <Card title="Publish">
            <div className="space-y-3">
              <Select value={p.status} onChange={(e) => set("status", e.target.value)} options={[{ value: "draft", label: "Draft (hidden)" }, { value: "published", label: "Published" }]} />
              <Field label="Publish date" help={scheduled ? "⏰ Scheduled — goes live automatically at this time." : "Set a future date to schedule the post."}>
                <Input type="datetime-local" value={toLocalInput(p.publishedAt)} onChange={(e) => e.target.value && set("publishedAt", new Date(e.target.value).toISOString())} />
              </Field>
              <Switch checked={p.featured} onChange={(v) => set("featured", v)} label="Featured post" />
              <Button className="w-full" onClick={save} loading={saving}>{isNew ? "Create post" : "Save changes"}</Button>
            </div>
          </Card>
          <Card title="Category & tags">
            <div className="space-y-3">
              <Select value={p.category || ""} onChange={(e) => set("category", e.target.value || null)} options={[{ value: "", label: "No category" }, ...cats.map((c) => ({ value: c._id, label: c.name }))]} />
              <div className="flex gap-2">
                <Input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="New category" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())} />
                <Button type="button" variant="outline" onClick={addCategory} aria-label="Add category"><Plus className="size-4" /></Button>
              </div>
              <TagsInput label="Tags" value={p.tags} onChange={(v) => set("tags", v)} />
            </div>
          </Card>
          <Card title="Cover image">
            <div className="space-y-3">
              <ImageField value={p.coverImage} onChange={(v) => set("coverImage", v)} />
              <Field label="Alt text" help="Describe the image for Google Images and screen readers.">
                <Input value={p.coverAlt} onChange={(e) => set("coverAlt", e.target.value)} />
              </Field>
            </div>
          </Card>
          <Card title="Author">
            <Field help="Leave empty to use the account that created the post.">
              <Input value={p.authorName} onChange={(e) => set("authorName", e.target.value)} placeholder="Author name (optional)" />
            </Field>
          </Card>
        </div>
      </div>
    </div>
  );
}
