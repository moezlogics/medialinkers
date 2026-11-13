"use client";

import Link from "next/link";
import { FileText, Lock, Plus } from "lucide-react";
import ResourceTable, { StatusBadge } from "@/components/admin/ResourceTable";
import { PageHeader } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

export default function PagesList() {
  return (
    <div>
      <PageHeader
        title="Pages"
        description="Every page is built from sections. Edit content, reorder blocks and manage SEO for each page."
        actions={<Link href="/newlogin/pages/new" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"><Plus className="size-4" /> New page</Link>}
      />
      <ResourceTable
        resource="pages"
        editHref={(p) => `/newlogin/pages/${p._id}`}
        canDelete={(p) => !p.system}
        filters={[{ key: "status", label: "Statuses", options: [{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }] }]}
        searchPlaceholder="Search pages…"
        columns={[
          {
            key: "title",
            label: "Page",
            render: (p) => (
              <span className="flex items-center gap-2">
                <FileText className="size-4 shrink-0 text-ink/40" />
                <span>{p.title}</span>
                {p.system && <span title="System page"><Lock className="size-3 text-ink/30" /></span>}
              </span>
            ),
          },
          { key: "slug", label: "URL", render: (p) => <span className="font-mono text-xs text-ink/60">{p.slug === "home" ? "/" : `/${p.slug}`}</span> },
          { key: "seo", label: "Meta description", hideOnMobile: true, render: (p) => (p.seo?.metaDescription ? <span className="text-xs text-green-700">✓ Set</span> : <span className="text-xs text-amber-600">Missing</span>) },
          { key: "status", label: "Status", render: (p) => <StatusBadge status={p.status} /> },
          { key: "updatedAt", label: "Updated", hideOnMobile: true, render: (p) => <span className="text-xs text-ink/50">{formatDate(p.updatedAt)}</span> },
        ]}
      />
    </div>
  );
}
