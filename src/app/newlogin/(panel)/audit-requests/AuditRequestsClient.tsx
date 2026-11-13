"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlarmClock, CheckCircle2, ExternalLink, Gauge, Globe, Inbox, Mail, MessageCircle, Search, Send, Timer } from "lucide-react";
import { toast } from "sonner";
import ResourceTable, { StatusBadge } from "@/components/admin/ResourceTable";
import { api, Button, Field, Input, Modal, PageHeader, Textarea } from "@/components/admin/ui";
import { cn, formatDate, whatsappLink } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Counts = { open: number; overdue: number; dueSoon: number; sentWeek: number; total: number };

const STATUSES = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "sent", label: "Audit sent" },
  { value: "won", label: "Became a client" },
  { value: "closed", label: "Closed" },
];

const HOUR = 3600_000;

function hours(ms: number) {
  const h = Math.abs(ms) / HOUR;
  return h < 1 ? `${Math.max(1, Math.round(h * 60))}m` : `${Math.floor(h)}h ${Math.round((h % 1) * 60)}m`;
}

/** Deadline chip: green while there is time, amber in the last 6 hours, red once late. */
function Deadline({ r, now }: { r: any; now: number }) {
  if (["sent", "won", "closed"].includes(r.status)) {
    return <span className="inline-flex items-center gap-1 text-xs text-green-700"><CheckCircle2 className="size-3.5" /> {r.sentAt ? `Sent ${formatDate(r.sentAt, { day: "numeric", month: "short" })}` : "Done"}</span>;
  }
  const left = new Date(r.dueAt || r.createdAt).getTime() - now;
  if (left < 0) return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700"><AlarmClock className="size-3.5" /> Late by {hours(left)}</span>;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", left < 6 * HOUR ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-700")}>
      <Timer className="size-3.5" /> {hours(left)} left
    </span>
  );
}

function mailto(r: any) {
  const subject = `Your free SEO audit for ${r.domain}`;
  const body = [
    `Hi${r.name ? ` ${r.name}` : ""},`,
    "",
    `Thanks for requesting a free SEO audit of ${r.website}. Our team has reviewed your website by hand and your report is ready:`,
    "",
    r.reportUrl || "[paste the report link here or attach the PDF]",
    "",
    "Top 3 priorities we recommend:",
    "1. ",
    "2. ",
    "3. ",
    "",
    "Happy to walk you through it on a quick call — just reply to this email.",
    "",
    "Best regards,",
    "Media Linkers",
  ].join("\n");
  return `mailto:${r.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function AuditRequestsClient({ counts }: { counts: Counts }) {
  const router = useRouter();
  const [row, setRow] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  async function save(patch: Record<string, string> = {}) {
    if (!row) return;
    setSaving(true);
    try {
      const body = { status: row.status, notes: row.notes || "", reportUrl: row.reportUrl || "", assignedTo: row.assignedTo || "", ...patch };
      await api(`/api/admin/c/audit-requests/${row._id}`, { method: "PUT", body });
      toast.success(patch.status === "sent" ? "Marked as sent" : "Saved");
      setRow(null);
      setReload((n) => n + 1);
      router.refresh();
    } catch {
    } finally {
      setSaving(false);
    }
  }

  const cards = [
    { label: "Open requests", value: counts.open, sub: `${counts.total} received in total`, icon: Inbox, tone: "bg-ink text-white" },
    { label: "Late", value: counts.overdue, sub: "Past the 24-hour promise", icon: AlarmClock, tone: counts.overdue ? "bg-red-600 text-white" : "border border-line bg-white" },
    { label: "Due within 6 hours", value: counts.dueSoon, sub: "Start these next", icon: Timer, tone: counts.dueSoon ? "bg-amber-400 text-ink" : "border border-line bg-white" },
    { label: "Sent this week", value: counts.sentWeek, sub: "Audits delivered", icon: Send, tone: "border border-line bg-white" },
  ];

  const href = (u: string) => (/^https?:/.test(u) ? u : `https://${u}`);

  return (
    <div>
      <PageHeader
        title="Audit requests"
        description="People who asked for a free SEO audit. Each one was promised a report by email within 24 hours — work top to bottom and mark it as sent."
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={cn("rounded-2xl p-4 sm:p-5", c.tone)}>
            <c.icon className="size-5 opacity-70" />
            <p className="mt-3 font-display text-3xl font-extrabold">{c.value}</p>
            <p className="text-sm font-semibold">{c.label}</p>
            <p className="text-xs opacity-70">{c.sub}</p>
          </div>
        ))}
      </div>

      <ResourceTable
        resource="audit-requests"
        reloadKey={reload}
        onEdit={setRow}
        searchPlaceholder="Search website, email, name…"
        filters={[{ key: "status", label: "All statuses", options: STATUSES }]}
        rowClassName={(r) => (r.status === "new" ? "bg-accent/[0.03]" : "")}
        empty={
          <div className="p-8 text-center text-sm text-ink/55">
            <Gauge className="mx-auto mb-2 size-8 text-ink/25" />
            No audit requests yet. They arrive from the “Free SEO audit” forms across the website.
          </div>
        }
        columns={[
          {
            key: "domain",
            label: "Website",
            render: (r) => (
              <span className="block min-w-0">
                <span className="block truncate font-semibold">{r.domain || r.website}</span>
                <span className="block truncate text-xs font-normal text-ink/50">{r.email}</span>
              </span>
            ),
          },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "dueAt", label: "Deadline", render: (r) => <Deadline r={r} now={now} /> },
          { key: "assignedTo", label: "Owner", hideOnMobile: true, render: (r) => <span className="text-xs text-ink/60">{r.assignedTo || "—"}</span> },
          { key: "createdAt", label: "Received", hideOnMobile: true, render: (r) => <span className="text-xs text-ink/50">{formatDate(r.createdAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span> },
        ]}
      />

      <Modal
        open={!!row}
        onClose={() => setRow(null)}
        title={row?.domain || "Audit request"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRow(null)}>Close</Button>
            {row && !["sent", "won", "closed"].includes(row.status) && (
              <Button variant="outline" onClick={() => save({ status: "sent" })} loading={saving}><CheckCircle2 className="size-4" /> Mark as sent</Button>
            )}
            <Button onClick={() => save()} loading={saving}>Save</Button>
          </>
        }
      >
        {row && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-ink p-4 text-white">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/10"><Globe className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <a href={href(row.website)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 break-all font-semibold hover:text-lime">
                  {row.website} <ExternalLink className="size-3.5" />
                </a>
                <p className="text-sm text-white/60">
                  {row.email}
                  {row.name ? ` · ${row.name}` : ""} · received {formatDate(row.createdAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <Deadline r={row} now={now} />
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/45">Research shortcuts</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "PageSpeed Insights", href: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(href(row.website))}`, icon: Gauge },
                  { label: "Indexed pages", href: `https://www.google.com/search?q=${encodeURIComponent(`site:${row.domain}`)}`, icon: Search },
                  { label: "Rich results test", href: `https://search.google.com/test/rich-results?url=${encodeURIComponent(href(row.website))}`, icon: CheckCircle2 },
                  { label: "Open website", href: href(row.website), icon: ExternalLink },
                ].map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-line hover:ring-ink/25">
                    <l.icon className="size-4 text-ink/50" /> {l.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/45">Progress</p>
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Status">
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    role="radio"
                    aria-checked={row.status === s.value}
                    onClick={() => setRow({ ...row, status: s.value })}
                    className={cn("rounded-full px-3 py-1.5 text-sm font-semibold transition-colors", row.status === s.value ? "bg-ink text-white" : "bg-paper text-ink/70 hover:bg-ink/10")}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Assigned to" help="Who is preparing this audit?">
                <Input value={row.assignedTo || ""} onChange={(e) => setRow({ ...row, assignedTo: e.target.value })} placeholder="e.g. Ali" />
              </Field>
              <Field label="Report link" help="Google Doc, PDF or Looker Studio link — added to the email.">
                <Input value={row.reportUrl || ""} onChange={(e) => setRow({ ...row, reportUrl: e.target.value })} placeholder="https://" inputMode="url" />
              </Field>
              <Field label="Internal notes" className="sm:col-span-2" help="Only visible to your team.">
                <Textarea value={row.notes || ""} onChange={(e) => setRow({ ...row, notes: e.target.value })} placeholder="Main issues found, follow-up plan…" />
              </Field>
            </div>

            <div className="flex flex-wrap gap-2 rounded-2xl bg-paper p-4">
              <a href={mailto(row)} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white">
                <Mail className="size-4" /> Email the audit
              </a>
              {row.phone && (
                <a href={whatsappLink(row.phone, `Hi${row.name ? ` ${row.name}` : ""}, this is Media Linkers about your free SEO audit for ${row.domain}.`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#25d366] px-4 py-2.5 text-sm font-semibold text-white">
                  <MessageCircle className="size-4" /> WhatsApp
                </a>
              )}
              <p className="w-full text-xs text-ink/55">Opens your email app with a ready-made message. After sending, click <b>Mark as sent</b>.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
