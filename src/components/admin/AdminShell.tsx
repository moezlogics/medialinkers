"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Briefcase, ExternalLink, FileText, FolderTree, Gauge, Image as ImageIcon, Inbox, LayoutDashboard, LogOut, Menu,
  MessageSquareQuote, Newspaper, Search, Settings, Shuffle, Sparkles, UserCircle, Users, X,
} from "lucide-react";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

type User = { name: string; email: string; role: "admin" | "editor" };

const NAV: { group: string; items: { href: string; label: string; icon: typeof FileText; admin?: boolean; badge?: "leads" | "audits" }[] }[] = [
  { group: "Overview", items: [{ href: "/newlogin", label: "Dashboard", icon: LayoutDashboard }, { href: "/newlogin/leads", label: "Leads", icon: Inbox, badge: "leads" }, { href: "/newlogin/audit-requests", label: "Audit requests", icon: Gauge, badge: "audits" }] },
  {
    group: "Content",
    items: [
      { href: "/newlogin/pages", label: "Pages", icon: FileText },
      { href: "/newlogin/services", label: "Services", icon: Sparkles },
      { href: "/newlogin/posts", label: "Blog posts", icon: Newspaper },
      { href: "/newlogin/categories", label: "Categories", icon: FolderTree },
      { href: "/newlogin/projects", label: "Case studies", icon: Briefcase },
      { href: "/newlogin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
      { href: "/newlogin/media", label: "Media library", icon: ImageIcon },
    ],
  },
  {
    group: "Growth",
    items: [
      { href: "/newlogin/seo", label: "SEO & health", icon: Search },
      { href: "/newlogin/redirects", label: "Redirects", icon: Shuffle },
    ],
  },
  {
    group: "System",
    items: [
      { href: "/newlogin/settings", label: "Settings", icon: Settings, admin: true },
      { href: "/newlogin/users", label: "Users", icon: Users, admin: true },
      { href: "/newlogin/profile", label: "My profile", icon: UserCircle },
    ],
  },
];

export default function AdminShell({ user, newLeads = 0, openAudits = 0, children }: { user: User; newLeads?: number; openAudits?: number; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // Close the mobile drawer after navigating
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const active = (href: string) => (href === "/newlogin" ? pathname === "/newlogin" : pathname.startsWith(href));

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/newlogin");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/newlogin" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full bg-white">
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true"><circle cx="7" cy="12" r="4" fill="none" stroke="#0b0b0f" strokeWidth="2.4" /><circle cx="17" cy="12" r="4" fill="none" stroke="var(--accent)" strokeWidth="2.4" /></svg>
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-bold text-white">Media Linkers</span>
            <span className="block text-[11px] text-white/45">Content manager</span>
          </span>
        </Link>
        <button onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full text-white/70 hover:bg-white/10 lg:hidden" aria-label="Close menu"><X className="size-5" /></button>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {NAV.map((g) => (
          <div key={g.group}>
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">{g.group}</p>
            <ul className="space-y-0.5">
              {g.items.filter((i) => !i.admin || user.role === "admin").map((i) => (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors", active(i.href) ? "bg-white text-ink" : "text-white/70 hover:bg-white/10 hover:text-white")}
                  >
                    <i.icon className={cn("size-[18px]", active(i.href) && "text-accent")} />
                    <span className="flex-1">{i.label}</span>
                    {i.badge === "leads" && newLeads > 0 && <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">{newLeads}</span>}
                    {i.badge === "audits" && openAudits > 0 && <span className="rounded-full bg-lime px-1.5 py-0.5 text-[10px] font-bold text-ink">{openAudits}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="grid size-9 place-items-center rounded-full bg-accent font-bold text-white">{user.name.slice(0, 1)}</span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-[11px] capitalize text-white/45">{user.role}</p>
          </div>
          <button onClick={logout} className="grid size-9 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white" title="Log out" aria-label="Log out"><LogOut className="size-4" /></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-[#f6f5f1] text-ink">
      <Toaster position="top-right" richColors closeButton />
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-ink lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-ink shadow-2xl">{sidebar}</aside>
        </div>
      )}
      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-[#f6f5f1]/90 px-4 py-3 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-xl bg-white ring-1 ring-line lg:hidden" aria-label="Open menu"><Menu className="size-5" /></button>
          <p className="hidden text-sm text-ink/50 sm:block">Welcome back, <b className="text-ink">{user.name.split(" ")[0]}</b> 👋</p>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/newlogin/leads" className="hidden items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-line hover:ring-ink/20 sm:flex">
              <Inbox className="size-4" /> {newLeads} new
            </Link>
            <a href="/" target="_blank" className="flex items-center gap-2 rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-white hover:bg-ink/85">
              <ExternalLink className="size-4" /> <span className="hidden sm:inline">View site</span>
            </a>
          </div>
        </header>
        <main className="mx-auto min-w-0 max-w-[1400px] p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

