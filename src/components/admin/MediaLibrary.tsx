"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, FileText, ImagePlus, Loader2, Search, Trash2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { api, Button, Field, Input, Modal } from "./ui";
import { cn } from "@/lib/utils";

export type MediaItem = { _id: string; url: string; filename: string; originalName: string; mime: string; size: number; width: number; height: number; alt: string; title: string; createdAt: string };

function fmtSize(b: number) {
  return b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;
}

export default function MediaLibrary({ onSelect, selectable = false }: { onSelect?: (m: MediaItem) => void; selectable?: boolean }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [active, setActive] = useState<MediaItem | null>(null);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const j = await api<{ items: MediaItem[] }>(`/api/admin/media?q=${encodeURIComponent(q)}`);
      setItems(j.items);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setUploading(true);
    const fd = new FormData();
    list.forEach((f) => fd.append("file", f));
    const res = await fetch("/api/admin/media", { method: "POST", body: fd });
    const j = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) return toast.error(j.error || "Upload failed");
    toast.success(`${j.items.length} file(s) uploaded`);
    setItems((prev) => [...j.items, ...prev]);
    setActive(j.items[0]);
  }

  async function save() {
    if (!active) return;
    await api(`/api/admin/media/${active._id}`, { method: "PUT", body: { alt: active.alt, title: active.title } });
    setItems((prev) => prev.map((m) => (m._id === active._id ? active : m)));
    toast.success("Saved");
  }

  async function remove() {
    if (!active || !confirm("Delete this file permanently? Pages using it will show a broken image.")) return;
    await api(`/api/admin/media/${active._id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((m) => m._id !== active._id));
    setActive(null);
    toast.success("Deleted");
  }

  const isImage = (m: MediaItem) => m.mime.startsWith("image/");

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search files…" className="pl-9" />
          </div>
          <Button type="button" onClick={() => fileRef.current?.click()} loading={uploading}>
            <UploadCloud className="size-4" /> Upload
          </Button>
          <input ref={fileRef} type="file" multiple accept="image/*,application/pdf,video/mp4,video/webm" hidden onChange={(e) => e.target.files && upload(e.target.files)} />
        </div>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            upload(e.dataTransfer.files);
          }}
          className={cn("min-h-[300px] rounded-2xl border-2 border-dashed p-2 transition-colors", drag ? "border-accent bg-accent/5" : "border-transparent")}
        >
          {loading ? (
            <div className="grid h-60 place-items-center text-ink/40"><Loader2 className="size-6 animate-spin" /></div>
          ) : items.length === 0 ? (
            <button type="button" onClick={() => fileRef.current?.click()} className="flex h-60 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/15 text-ink/50">
              <ImagePlus className="size-8" />
              <span className="text-sm">Drop files here or click to upload</span>
              <span className="text-xs">Images are auto-converted to WebP for speed</span>
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
              {items.map((m) => (
                <button
                  key={m._id}
                  type="button"
                  onClick={() => setActive(m)}
                  onDoubleClick={() => selectable && onSelect?.(m)}
                  className={cn("group relative aspect-square overflow-hidden rounded-xl border bg-[repeating-conic-gradient(#f1f1f1_0_25%,#fff_0_50%)] bg-[length:16px_16px]", active?._id === m._id ? "border-accent ring-2 ring-accent" : "border-line")}
                  title={m.originalName}
                >
                  {isImage(m) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt={m.alt} loading="lazy" className="size-full object-contain" />
                  ) : (
                    <span className="grid size-full place-items-center bg-white"><FileText className="size-8 text-ink/40" /></span>
                  )}
                  {active?._id === m._id && <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-accent text-white"><Check className="size-3" /></span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-paper/50 p-4">
        {active ? (
          <div className="space-y-3">
            <div className="aspect-video overflow-hidden rounded-xl border border-line bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {isImage(active) ? <img src={active.url} alt={active.alt} className="size-full object-contain" /> : <div className="grid size-full place-items-center"><FileText className="size-10 text-ink/40" /></div>}
            </div>
            <div className="text-xs text-ink/55">
              <p className="truncate font-semibold text-ink">{active.originalName}</p>
              <p>{fmtSize(active.size)}{active.width ? ` · ${active.width}×${active.height}` : ""} · {active.mime}</p>
            </div>
            <Field label="Alt text" help="Describe the image for Google & screen readers.">
              <Input value={active.alt} onChange={(e) => setActive({ ...active, alt: e.target.value })} />
            </Field>
            <Field label="Title">
              <Input value={active.title} onChange={(e) => setActive({ ...active, title: e.target.value })} />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="dark" onClick={save}>Save</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(location.origin + active.url); toast.success("URL copied"); }}>
                <Copy className="size-3.5" /> Copy URL
              </Button>
              <Button type="button" size="sm" variant="ghost" className="text-red-600" onClick={remove}><Trash2 className="size-3.5" /></Button>
            </div>
            {selectable && (
              <Button type="button" className="w-full" onClick={() => onSelect?.(active)}>
                <Check className="size-4" /> Use this file
              </Button>
            )}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-ink/45">Select a file to see details</p>
        )}
      </div>
    </div>
  );
}

export function MediaPicker({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (m: MediaItem) => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Media library" size="xl">
      <MediaLibrary
        selectable
        onSelect={(m) => {
          onSelect(m);
          onClose();
        }}
      />
    </Modal>
  );
}

export function ImageField({ value, onChange, label, help }: { value?: string; onChange: (v: string) => void; label?: string; help?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Field label={label} help={help}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-ink/20 bg-paper text-ink/40 hover:border-accent hover:text-accent"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value ? <img src={value} alt="" className="size-full object-cover" /> : <ImagePlus className="size-6" />}
        </button>
        <div className="min-w-0 flex-1 space-y-2">
          <Input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="/media/… or https://…" />
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>Choose</Button>
            {value && <Button type="button" size="sm" variant="ghost" onClick={() => onChange("")}><X className="size-3.5" /> Remove</Button>}
          </div>
        </div>
      </div>
      <MediaPicker open={open} onClose={() => setOpen(false)} onSelect={(m) => onChange(m.url)} />
    </Field>
  );
}
