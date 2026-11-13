"use client";

import Link from "next/link";
import { Plus, Star } from "lucide-react";
import ResourceTable, { StatusBadge } from "@/components/admin/ResourceTable";
import { PageHeader } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

export default function PostsList() {
  return (
    <div>
      <PageHeader
        title="Blog posts"
        description="Write, schedule and optimize articles. Posts with a future date go live automatically."
        actions={<Link href="/newlogin/posts/new" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"><Plus className="size-4" /> New post</Link>}
      />
      <ResourceTable
        resource="posts"
        editHref={(p) => `/newlogin/posts/${p._id}`}
        filters={[{ key: "status", label: "Statuses", options: [{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }] }]}
        searchPlaceholder="Search posts by title or tag…"
        columns={[
          {
            key: "title",
            label: "Post",
            render: (p) => (
              <span className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.coverImage ? <img src={p.coverImage} alt="" className="h-10 w-14 shrink-0 rounded-lg object-cover" /> : <span className="h-10 w-14 shrink-0 rounded-lg bg-ink/90" />}
                <span className="min-w-0">
                  <span className="line-clamp-1">{p.title}</span>
                  {p.featured && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent"><Star className="size-3 fill-current" /> Featured</span>}
                </span>
              </span>
            ),
          },
          { key: "category", label: "Category", render: (p) => <span className="text-xs">{p.category?.name || "—"}</span> },
          {
            key: "status",
            label: "Status",
            render: (p) =>
              p.status === "published" && new Date(p.publishedAt) > new Date() ? (
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700">Scheduled</span>
              ) : (
                <StatusBadge status={p.status} />
              ),
          },
          { key: "seo", label: "Meta", hideOnMobile: true, render: (p) => (p.seo?.metaDescription ? <span className="text-xs text-green-700">✓ Set</span> : <span className="text-xs text-amber-600">Missing</span>) },
          { key: "publishedAt", label: "Date", render: (p) => <span className="text-xs text-ink/50">{formatDate(p.publishedAt)}</span> },
        ]}
      />
    </div>
  );
}
