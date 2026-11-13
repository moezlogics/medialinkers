"use client";

import { useState } from "react";
import { Download, Mail, MessageCircle, Phone, Globe } from "lucide-react";
import { toast } from "sonner";
import ResourceTable, { StatusBadge } from "@/components/admin/ResourceTable";
import { api, Button, Field, Modal, PageHeader, Select, Textarea } from "@/components/admin/ui";
import { formatDate, whatsappLink } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
const STATUSES = ["new", "contacted", "qualified", "won", "lost"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }));
const TYPES = [
  { value: "contact", label: "Contact form" },
  { value: "quote", label: "Quote / package" },
  { value: "newsletter", label: "Newsletter" },
];
const typeLabel = (t: string) => TYPES.find((x) => x.value === t)?.label || t;

export default function LeadsPage() {
  const [lead, setLead] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);

  async function save() {
    setSaving(true);
    try {
      await api(`/api/admin/c/leads/${lead._id}`, { method: "PUT", body: { status: lead.status, notes: lead.notes } });
      toast.success("Lead updated");
      setLead(null);
      setReload((r) => r + 1);
    } catch {
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Every form submission from the website: contact, quotes and newsletter sign-ups. Free audit requests have their own page."
        actions={
          // eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page
          <a href="/api/admin/leads/export" download className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold ring-1 ring-line hover:ring-ink/20">
            <Download className="size-4" /> Export CSV
          </a>
        }
      />
      <ResourceTable
        resource="leads"
        reloadKey={reload}
        onEdit={setLead}
        searchPlaceholder="Search name, email, phone, website…"
        filters={[
          { key: "status", label: "Statuses", options: STATUSES },
          { key: "type", label: "Sources", options: TYPES },
        ]}
        rowClassName={(l) => (l.status === "new" ? "bg-accent/[0.03]" : "")}
        columns={[
          {
            key: "name",
            label: "Lead",
            render: (l) => (
              <span className="block">
                <span className="block">{l.name || l.email}</span>
                {l.name && <span className="block text-xs font-normal text-ink/50">{l.email}</span>}
              </span>
            ),
          },
          { key: "type", label: "Source", render: (l) => <span className="text-xs">{typeLabel(l.type)}</span> },
          { key: "service", label: "Interest", hideOnMobile: true, render: (l) => <span className="line-clamp-1 text-xs text-ink/60">{l.service || l.website || "—"}</span> },
          { key: "status", label: "Status", render: (l) => <StatusBadge status={l.status} /> },
          { key: "createdAt", label: "Received", render: (l) => <span className="text-xs text-ink/50">{formatDate(l.createdAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span> },
        ]}
      />

      <Modal
        open={!!lead}
        onClose={() => setLead(null)}
        title={lead?.name || lead?.email || "Lead"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setLead(null)}>Close</Button>
            <Button onClick={save} loading={saving}>Save</Button>
          </>
        }
      >
        {lead && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {lead.email && <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-white"><Mail className="size-4" /> Email</a>}
              {lead.phone && <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-line"><Phone className="size-4" /> Call</a>}
              {lead.phone && <a href={whatsappLink(lead.phone, `Hi ${lead.name || ""}, this is Media Linkers.`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-[#25d366] px-3 py-2 text-sm font-semibold text-white"><MessageCircle className="size-4" /> WhatsApp</a>}
              {lead.website && <a href={/^https?:/.test(lead.website) ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-line"><Globe className="size-4" /> Website</a>}
            </div>
            <dl className="grid gap-2 rounded-2xl bg-paper p-4 text-sm sm:grid-cols-2">
              {[
                ["Source", typeLabel(lead.type)],
                ["Received", formatDate(lead.createdAt, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })],
                ["Email", lead.email],
                ["Phone", lead.phone],
                ["Company", lead.company],
                ["Website", lead.website],
                ["Service", lead.service],
                ["Budget", lead.budget],
                ["Page", lead.sourcePage],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-ink/50">{k}</dt>
                    <dd className="break-words font-medium">{v}</dd>
                  </div>
                ))}
            </dl>
            {lead.message && (
              <div>
                <p className="mb-1 text-xs font-semibold text-ink/50">Message</p>
                <p className="whitespace-pre-wrap rounded-2xl border border-line p-4 text-sm leading-relaxed">{lead.message}</p>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
              <Field label="Status">
                <Select value={lead.status} onChange={(e) => setLead({ ...lead, status: e.target.value })} options={STATUSES} />
              </Field>
              <Field label="Internal notes" help="Only visible to your team.">
                <Textarea value={lead.notes || ""} onChange={(e) => setLead({ ...lead, notes: e.target.value })} placeholder="Called on Monday, sending proposal…" />
              </Field>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
