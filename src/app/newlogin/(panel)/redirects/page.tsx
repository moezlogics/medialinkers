"use client";

import ModalCrud from "@/components/admin/ModalCrud";

export default function RedirectsPage() {
  return (
    <ModalCrud
      resource="redirects"
      title="Redirects"
      singular="redirect"
      description="Send old or changed URLs to their new address so you keep your Google rankings. Use 301 for permanent moves."
      defaults={{ from: "", to: "", code: "301", active: true }}
      load={(r) => ({ ...r, code: String(r.code || 301) })}
      prepare={(r) => ({ ...r, code: Number(r.code) || 301 })}
      fields={[
        { name: "from", label: "Old URL path", type: "text", placeholder: "/old-page", help: "Path only, e.g. /old-page (a full URL also works)" },
        { name: "to", label: "New URL", type: "text", placeholder: "/new-page or https://…" },
        { name: "code", label: "Type", type: "select", options: [{ value: "301", label: "301 — Permanent (recommended)" }, { value: "302", label: "302 — Temporary" }] },
        { name: "active", label: "Active", type: "toggle" },
      ]}
      columns={[
        { key: "from", label: "From", render: (r) => <span className="font-mono text-xs">{r.from}</span> },
        { key: "to", label: "To", render: (r) => <span className="font-mono text-xs text-ink/70">→ {r.to}</span> },
        { key: "code", label: "Type", render: (r) => <span className="rounded bg-ink/5 px-1.5 py-0.5 text-[11px] font-semibold">{r.code}</span> },
        { key: "hits", label: "Hits", hideOnMobile: true },
        { key: "active", label: "Status", render: (r) => (r.active ? <span className="text-xs font-semibold text-green-700">Active</span> : <span className="text-xs text-ink/45">Off</span>) },
      ]}
    />
  );
}
