"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Loader2, Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, Empty, Input, Select } from "./ui";
import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Column = { key: string; label: string; render?: (item: any) => ReactNode; className?: string; hideOnMobile?: boolean };
export type Filter = { key: string; label: string; options: { value: string; label: string }[] };

export default function ResourceTable({
  resource,
  columns,
  filters = [],
  editHref,
  onEdit,
  canDelete = true,
  searchPlaceholder = "Search…",
  empty,
  reloadKey = 0,
  limit = 25,
  extraQuery = "",
  rowClassName,
}: {
  resource: string;
  columns: Column[];
  filters?: Filter[];
  editHref?: (item: any) => string;
  onEdit?: (item: any) => void;
  canDelete?: boolean | ((item: any) => boolean);
  searchPlaceholder?: string;
  empty?: ReactNode;
  reloadKey?: number;
  limit?: number;
  extraQuery?: string;
  rowClassName?: (item: any) => string;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [filterVals, setFilterVals] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit), q });
    Object.entries(filterVals).forEach(([k, v]) => v && params.set(k, v));
    try {
      const j = await api(`/api/admin/c/${resource}?${params}${extraQuery}`);
      setItems(j.items);
      setTotal(j.total);
      setPages(j.pages);
    } finally {
      setLoading(false);
    }
  }, [resource, page, q, filterVals, limit, extraQuery]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q, reloadKey]);

  async function remove(item: any) {
    const name = item.title || item.name || item.from || item.email || "this item";
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await api(`/api/admin/c/${resource}/${item._id}`, { method: "DELETE" });
    toast.success("Deleted");
    load();
  }

  const allowDelete = (it: any) => (typeof canDelete === "function" ? canDelete(it) : canDelete);
  const editLink = (it: any, children: ReactNode, className?: string) =>
    editHref ? (
      <Link href={editHref(it)} className={className}>{children}</Link>
    ) : onEdit ? (
      <button type="button" onClick={() => onEdit(it)} className={cn("text-left", className)}>{children}</button>
    ) : (
      <span className={className}>{children}</span>
    );

  return (
    <div className="rounded-2xl border border-line bg-white">
      <div className="flex flex-col gap-2 border-b border-line p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={searchPlaceholder} className="pl-9" />
        </div>
        {filters.map((f) => (
          <Select
            key={f.key}
            value={filterVals[f.key] || ""}
            onChange={(e) => { setFilterVals({ ...filterVals, [f.key]: e.target.value }); setPage(1); }}
            options={[{ value: "", label: `All ${f.label.toLowerCase()}` }, ...f.options]}
            className="sm:w-44"
          />
        ))}
      </div>

      {loading && !items.length ? (
        <div className="grid h-48 place-items-center text-ink/40"><Loader2 className="size-6 animate-spin" /></div>
      ) : !items.length ? (
        <div className="p-4">{empty || <Empty title="Nothing here yet" text={q ? "No results for your search." : undefined} />}</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-ink/45">
                  {columns.map((c) => <th key={c.key} className={cn("px-4 py-3 font-semibold", c.className)}>{c.label}</th>)}
                  <th className="w-24 px-4 py-3" />
                </tr>
              </thead>
              <tbody className={cn(loading && "opacity-60")}>
                {items.map((it) => (
                  <tr key={it._id} className={cn("group border-b border-line last:border-0 hover:bg-paper/50", rowClassName?.(it))}>
                    {columns.map((c, i) => (
                      <td key={c.key} className={cn("px-4 py-3 align-middle", c.className)}>
                        {i === 0 ? editLink(it, c.render ? c.render(it) : it[c.key], "font-semibold hover:text-accent") : c.render ? c.render(it) : String(it[c.key] ?? "")}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {editLink(it, <Pencil className="size-4" />, "grid size-8 place-items-center rounded-lg text-ink/60 hover:bg-ink/5 hover:text-ink")}
                        {allowDelete(it) && (
                          <button type="button" onClick={() => remove(it)} className="grid size-8 place-items-center rounded-lg text-ink/40 hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className={cn("divide-y divide-line md:hidden", loading && "opacity-60")}>
            {items.map((it) => (
              <li key={it._id} className={cn("flex items-start gap-3 p-3", rowClassName?.(it))}>
                <div className="min-w-0 flex-1 space-y-1">
                  {editLink(it, columns[0].render ? columns[0].render(it) : it[columns[0].key], "block font-semibold")}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/55">
                    {columns.slice(1).filter((c) => !c.hideOnMobile).map((c) => (
                      <span key={c.key}>{c.render ? c.render(it) : String(it[c.key] ?? "")}</span>
                    ))}
                  </div>
                </div>
                {allowDelete(it) && (
                  <button type="button" onClick={() => remove(it)} className="grid size-8 shrink-0 place-items-center rounded-lg text-ink/40 hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm">
          <span className="text-ink/50">{total} items · page {page} of {pages}</span>
          <div className="flex gap-1">
            <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="grid size-8 place-items-center rounded-lg ring-1 ring-line disabled:opacity-40" aria-label="Previous"><ChevronLeft className="size-4" /></button>
            <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className="grid size-8 place-items-center rounded-lg ring-1 ring-line disabled:opacity-40" aria-label="Next"><ChevronRight className="size-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status?: string }) {
  const tone: Record<string, string> = {
    published: "bg-green-100 text-green-700",
    draft: "bg-amber-100 text-amber-700",
    new: "bg-accent/10 text-accent",
    contacted: "bg-sky-100 text-sky-700",
    qualified: "bg-violet-100 text-violet-700",
    won: "bg-green-100 text-green-700",
    lost: "bg-ink/5 text-ink/50",
    in_progress: "bg-sky-100 text-sky-700",
    sent: "bg-green-100 text-green-700",
    closed: "bg-ink/5 text-ink/50",
  };
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", tone[status || ""] || "bg-ink/5 text-ink/60")}>{status?.replace("_", " ")}</span>;
}
