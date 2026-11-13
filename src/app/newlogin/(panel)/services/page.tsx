"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CornerDownRight, Plus } from "lucide-react";
import ResourceTable, { StatusBadge } from "@/components/admin/ResourceTable";
import { api, PageHeader, Tabs } from "@/components/admin/ui";
import { Icon } from "@/lib/icons";

type Row = { _id: string; title: string; slug: string; parent?: string | null };

export default function ServicesList() {
  const [mains, setMains] = useState<Record<string, Row>>({});
  const [view, setView] = useState("all");

  useEffect(() => {
    api<{ items: Row[] }>("/api/admin/c/services?limit=200", { silent: true })
      .then((j) => setMains(Object.fromEntries(j.items.filter((x) => !x.parent).map((x) => [x._id, x]))))
      .catch(() => {});
  }, []);

  const url = (s: Row) => (s.parent && mains[s.parent] ? `/${mains[s.parent].slug}/${s.slug}` : `/${s.slug}`);

  return (
    <div>
      <PageHeader
        title="Services"
        description="Main services have their own page and menu column. Sub-services (e.g. Local SEO under SEO) get a page at /main-service/sub-service."
        actions={<Link href="/newlogin/services/new" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"><Plus className="size-4" /> New service</Link>}
      />
      <div className="mb-3">
        <Tabs
          tabs={[{ id: "all", label: "All" }, { id: "main", label: "Main services" }, ...Object.values(mains).map((m) => ({ id: m._id, label: m.title.replace(/\s*\(.*\)$/, "") }))]}
          active={view}
          onChange={setView}
        />
      </div>
      <ResourceTable
        key={view}
        resource="services"
        limit={100}
        extraQuery={view === "all" ? "" : view === "main" ? "&parent=none" : `&parent=${view}`}
        editHref={(s) => `/newlogin/services/${s._id}`}
        searchPlaceholder="Search services…"
        columns={[
          {
            key: "title",
            label: "Service",
            render: (s) => (
              <span className="flex items-center gap-3">
                {s.parent && <CornerDownRight className="size-4 shrink-0 text-ink/30" />}
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-paper"><Icon name={s.icon} className="size-4" /></span>
                <span>{s.title}</span>
              </span>
            ),
          },
          { key: "parent", label: "Type", render: (s) => (s.parent ? <span className="text-xs text-ink/60">Sub of {mains[s.parent]?.title.replace(/\s*\(.*\)$/, "") || "…"}</span> : <span className="text-xs font-semibold text-accent">Main service</span>) },
          { key: "slug", label: "URL", hideOnMobile: true, render: (s) => <span className="font-mono text-xs text-ink/60">{url(s)}</span> },
          { key: "order", label: "Order", hideOnMobile: true },
          { key: "status", label: "Status", render: (s) => <StatusBadge status={s.status} /> },
        ]}
      />
    </div>
  );
}
