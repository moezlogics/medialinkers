"use client";

import Link from "next/link";
import { Briefcase, Plus } from "lucide-react";
import ResourceTable, { StatusBadge } from "@/components/admin/ResourceTable";
import { Empty, PageHeader } from "@/components/admin/ui";

export default function ProjectsList() {
  const add = (
    <Link href="/newlogin/projects/new" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white">
      <Plus className="size-4" /> New case study
    </Link>
  );
  return (
    <div>
      <PageHeader title="Case studies" description="Client success stories. Client results. Published ones appear on /case-studies, featured ones on the home page, and each one on the service pages it is linked to." actions={add} />
      <ResourceTable
        resource="projects"
        editHref={(p) => `/newlogin/projects/${p._id}`}
        empty={<Empty icon={<Briefcase className="size-10" />} title="No case studies yet" text="Add your first client success story — results, process and screenshots." action={add} />}
        columns={[
          {
            key: "title",
            label: "Case study",
            render: (p) => (
              <span className="block">
                <span className="block">{p.title}</span>
                <span className="block text-xs font-normal text-ink/50">{p.results?.[0] ? `${p.results[0].value} ${p.results[0].label}` : p.slug}</span>
              </span>
            ),
          },
          { key: "client", label: "Client" },
          { key: "industry", label: "Industry", hideOnMobile: true },
          { key: "featured", label: "Home", hideOnMobile: true, render: (p) => (p.featured ? <span className="rounded-full bg-lime px-2 py-0.5 text-[11px] font-bold">Featured</span> : <span className="text-xs text-ink/40">—</span>) },
          { key: "status", label: "Status", render: (p) => <StatusBadge status={p.status} /> },
        ]}
      />
    </div>
  );
}
