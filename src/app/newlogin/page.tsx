import Link from "next/link";
import { ArrowUpRight, FileText, Gauge, Image as ImageIcon, Inbox, Newspaper, PenSquare, Plus, Settings, Search } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import LoginForm from "@/components/admin/LoginForm";
import { getSession } from "@/lib/auth";
import { AuditRequest, Lead, Media, Page, Post, Service } from "@/lib/models";
import { seoHealth } from "@/lib/seo-health";
import { cn, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DAY = 86400000;

/* eslint-disable @typescript-eslint/no-explicit-any */
async function dashboardData() {
  const since = new Date(Date.now() - 13 * DAY);
  since.setHours(0, 0, 0, 0);
  const [leadsNew, leadsWeek, leadsTotal, posts, drafts, pages, services, subServices, audits, media, recentLeads, recentAudits, perDay, health] = await Promise.all([
    Lead.countDocuments({ status: "new" }),
    Lead.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * DAY) } }),
    Lead.countDocuments(),
    Post.countDocuments({ status: "published" }),
    Post.countDocuments({ status: "draft" }),
    Page.countDocuments(),
    Service.countDocuments({ parent: null }),
    Service.countDocuments({ parent: { $ne: null } }),
    AuditRequest.countDocuments({ status: { $in: ["new", "in_progress"] } }),
    Media.countDocuments(),
    Lead.find().sort({ createdAt: -1 }).limit(6).lean<any[]>(),
    AuditRequest.find({}, "domain website email status dueAt sentAt createdAt").sort({ createdAt: -1 }).limit(6).lean<any[]>(),
    Lead.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, n: { $sum: 1 } } }]),
    seoHealth(),
  ]);
  const lateAudits = await AuditRequest.countDocuments({ status: { $in: ["new", "in_progress"] }, dueAt: { $lt: new Date() } });
  const map = new Map(perDay.map((d: any) => [d._id, d.n as number]));
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since.getTime() + i * DAY);
    const key = d.toISOString().slice(0, 10);
    return { key, label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), n: map.get(key) || 0 };
  });
  return { leadsNew, leadsWeek, leadsTotal, posts, drafts, pages, services, subServices, audits, lateAudits, media, recentLeads, recentAudits, days, health, renderedAt: Date.now() };
}

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const session = await getSession();
  if (!session) return <LoginForm />;
  const { denied } = await searchParams;
  const d = await dashboardData();
  const max = Math.max(1, ...d.days.map((x) => x.n));
  const total14 = d.days.reduce((a, x) => a + x.n, 0);
  const now = d.renderedAt;

  const stats = [
    { label: "New leads", value: d.leadsNew, sub: `${d.leadsWeek} this week · ${d.leadsTotal} total`, href: "/newlogin/leads", icon: Inbox, accent: true },
    { label: "Audits to send", value: d.audits, sub: d.lateAudits ? `${d.lateAudits} past 24 hours!` : "All on time", href: "/newlogin/audit-requests", icon: Gauge },
    { label: "Blog posts", value: d.posts, sub: `${d.drafts} drafts · ${d.services} services`, href: "/newlogin/posts", icon: Newspaper },
    { label: "SEO health", value: `${d.health.score}%`, sub: `${d.health.issues.length} issues to review`, href: "/newlogin/seo", icon: Search },
  ];
  const actions = [
    { label: "Write a blog post", href: "/newlogin/posts/new", icon: PenSquare },
    { label: "Edit home page", href: "/newlogin/pages", icon: FileText },
    { label: "Add a service", href: "/newlogin/services/new", icon: Plus },
    { label: "Upload media", href: "/newlogin/media", icon: ImageIcon },
    { label: "Audit requests", href: "/newlogin/audit-requests", icon: Gauge },
    ...(session.role === "admin" ? [{ label: "Site settings", href: "/newlogin/settings", icon: Settings }] : []),
  ];

  return (
    <AdminShell user={{ name: session.name, email: session.email, role: session.role }} newLeads={d.leadsNew}>
      {denied && <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">That section is only available to admins.</p>}
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-ink/55">Here’s what’s happening on medialinkers.pk.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={cn("group rounded-2xl p-4 transition-all hover:-translate-y-0.5 sm:p-5", s.accent ? "bg-accent text-white" : "border border-line bg-white hover:border-ink/25")}>
            <div className="flex items-center justify-between">
              <s.icon className={cn("size-5", s.accent ? "text-white/80" : "text-ink/40")} />
              <ArrowUpRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">{s.value}</p>
            <p className="text-sm font-semibold">{s.label}</p>
            <p className={cn("text-xs", s.accent ? "text-white/75" : "text-ink/50")}>{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-line bg-white p-4 sm:p-5">
          <div className="mb-4 flex items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold">Leads — last 14 days</h2>
              <p className="text-xs text-ink/50">{total14} leads in total</p>
            </div>
            <Link href="/newlogin/leads" className="text-xs font-semibold text-accent">All leads →</Link>
          </div>
          <div className="flex h-44 items-end gap-1.5 sm:gap-2" role="img" aria-label={`Leads per day for the last 14 days, ${total14} in total`}>
            {d.days.map((x) => (
              <div key={x.key} className="group flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${x.label}: ${x.n} lead${x.n === 1 ? "" : "s"}`}>
                <span className="text-[10px] font-semibold text-ink/60 opacity-0 transition-opacity group-hover:opacity-100">{x.n}</span>
                <div className="w-full rounded-t-md bg-accent/85 transition-colors group-hover:bg-accent" style={{ height: `${Math.max(x.n ? 6 : 2, (x.n / max) * 100)}%`, opacity: x.n ? 1 : 0.25 }} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-ink/45">
            <span>{d.days[0].label}</span>
            <span>{d.days[6].label}</span>
            <span>Today</span>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-4 sm:p-5">
          <h2 className="mb-3 font-display text-base font-bold">Quick actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {actions.map((a) => (
              <Link key={a.href} href={a.href} className="flex items-center gap-2 rounded-xl bg-paper px-3 py-3 text-sm font-semibold transition-colors hover:bg-ink hover:text-white">
                <a.icon className="size-4 shrink-0" /> <span className="truncate">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
            <h2 className="font-display text-base font-bold">Recent leads</h2>
            <Link href="/newlogin/leads" className="text-xs font-semibold text-accent">View all →</Link>
          </div>
          {d.recentLeads.length === 0 ? (
            <p className="p-5 text-sm text-ink/50">No leads yet. They’ll appear here as soon as someone fills a form.</p>
          ) : (
            <ul className="divide-y divide-line">
              {d.recentLeads.map((l) => (
                <li key={String(l._id)}>
                  <Link href="/newlogin/leads" className="flex items-center gap-3 px-4 py-3 hover:bg-paper/60 sm:px-5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-white">{(l.name || l.email || "?").slice(0, 1).toUpperCase()}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{l.name || l.email}</span>
                      <span className="block truncate text-xs text-ink/50">{l.type} · {l.service || l.website || l.email}</span>
                    </span>
                    {l.status === "new" && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">New</span>}
                    <span className="hidden text-xs text-ink/45 sm:block">{formatDate(l.createdAt, { day: "numeric", month: "short" })}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
            <h2 className="font-display text-base font-bold">Latest audit requests</h2>
            <Link href="/newlogin/audit-requests" className="text-xs font-semibold text-accent">View all →</Link>
          </div>
          {d.recentAudits.length === 0 ? (
            <p className="p-5 text-sm text-ink/50">No audit requests yet. They arrive from the free audit forms on the website.</p>
          ) : (
            <ul className="divide-y divide-line">
              {d.recentAudits.map((a) => {
                const open = ["new", "in_progress"].includes(a.status);
                const late = open && new Date(a.dueAt).getTime() < now;
                const tone = !open ? "bg-green-100 text-green-700" : late ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800";
                return (
                  <li key={String(a._id)}>
                    <Link href="/newlogin/audit-requests" className="flex items-center gap-3 px-4 py-3 hover:bg-paper/60 sm:px-5">
                      <span className={cn("grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold", tone)}>{(a.domain || "?").slice(0, 1).toUpperCase()}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{a.domain || a.website}</span>
                        <span className="block truncate text-xs text-ink/50">{a.email}</span>
                      </span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", tone)}>{!open ? "Sent" : late ? "Late" : "Due"}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
