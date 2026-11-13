"use client";

import Link from "next/link";
import { ArrowLeft, Eye, ExternalLink, Save } from "lucide-react";
import { Button } from "./ui";

export default function EditorBar({
  backHref, backLabel, title, saving, dirty, onSave, viewHref, previewHref, isNew,
}: {
  backHref: string; backLabel: string; title: string; saving: boolean; dirty: boolean; onSave: () => void; viewHref?: string; previewHref?: string; isNew?: boolean;
}) {
  return (
    <div className="sticky top-[65px] z-20 -mx-4 mb-5 border-b border-line bg-[#f6f5f1]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={backHref} className="grid size-9 shrink-0 place-items-center rounded-xl bg-white ring-1 ring-line hover:ring-ink/20" aria-label={`Back to ${backLabel}`}>
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-ink/45">{backLabel}</p>
          <h1 className="truncate font-display text-lg font-bold sm:text-xl">{title || "Untitled"}</h1>
        </div>
        <div className="flex items-center gap-2">
          {dirty && <span className="hidden text-xs font-semibold text-amber-600 sm:inline">Unsaved changes</span>}
          {previewHref && !isNew && (
            <a href={`/api/admin/preview?path=${encodeURIComponent(previewHref)}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold ring-1 ring-line hover:ring-ink/20" title="Preview, including drafts">
              <Eye className="size-4" /> <span className="hidden sm:inline">Preview</span>
            </a>
          )}
          {viewHref && !isNew && (
            <a href={viewHref} target="_blank" rel="noopener" className="hidden items-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold ring-1 ring-line hover:ring-ink/20 sm:inline-flex">
              <ExternalLink className="size-4" /> View
            </a>
          )}
          <Button onClick={onSave} loading={saving} title="Save (Ctrl+S)">
            <Save className="size-4" /> {isNew ? "Create" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
