"use client";

import { useId, useState } from "react";
import { ArrowRight, Check, Globe, Loader2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  tone?: "dark" | "light";
  /** "inline" puts both fields and the button in one pill on wide screens */
  layout?: "inline" | "stack";
  buttonLabel?: string;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
};

/**
 * Free audit request: just a website and an email. Our team reviews the site by hand
 * and emails the report within 24 hours (requests land in the admin panel).
 */
export default function AuditRequestForm({ tone = "light", layout = "inline", buttonLabel = "Get my free audit", placeholder = "yourwebsite.com", autoFocus, className }: Props) {
  const id = useId();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<{ text: string; field?: string } | null>(null);
  const [sent, setSent] = useState({ domain: "", email: "" });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError(null);
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      const res = await fetch("/api/audit-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fd, sourcePage: location.pathname }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("idle");
        setError({ text: j.error || "Something went wrong. Please try again.", field: j.field });
        return;
      }
      setSent({ domain: j.domain || fd.website, email: fd.email });
      setState("done");
      const w = window as unknown as { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };
      w.gtag?.("event", "generate_lead", { form_type: "seo_audit" });
      w.fbq?.("track", "Lead", { content_name: "SEO audit" });
    } catch {
      setState("idle");
      setError({ text: "Network error. Please check your connection and try again." });
    }
  }

  const dark = tone === "dark";

  if (state === "done") {
    return (
      <div role="status" className={cn("anim-pop flex items-start gap-4 rounded-[1.4rem] p-5", dark ? "bg-white/[0.07] text-white ring-1 ring-white/15" : "bg-paper text-ink ring-1 ring-line", className)}>
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-lime text-ink"><Check className="size-5" strokeWidth={3} /></span>
        <div>
          <p className="font-display text-xl font-bold leading-tight">Request received — we’re on it!</p>
          <p className={cn("mt-1 text-[15px] leading-relaxed", dark ? "text-white/70" : "text-muted")}>
            An SEO specialist will review <b className={dark ? "text-white" : "text-ink"}>{sent.domain}</b> by hand and email your audit to <b className={dark ? "text-white" : "text-ink"}>{sent.email}</b> within 24 hours.
          </p>
        </div>
      </div>
    );
  }

  const inline = layout === "inline";
  const input = cn(
    "w-full min-w-0 bg-transparent py-3.5 text-[15px] focus:outline-none",
    dark && !inline ? "text-white placeholder:text-white/45" : "text-ink placeholder:text-muted",
  );
  const box = (bad: boolean) =>
    cn(
      "flex flex-1 items-center gap-2.5 px-4 transition-colors",
      inline
        ? "rounded-full bg-white sm:rounded-none sm:bg-transparent"
        : cn("rounded-2xl ring-1", dark ? "bg-white/[0.06] ring-white/15 focus-within:ring-white/50" : "bg-paper/70 ring-line focus-within:bg-white focus-within:ring-ink"),
      bad && "ring-2 !ring-red-500",
    );

  return (
    <form onSubmit={submit} className={className}>
      <div className={cn(inline ? "flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:bg-white sm:p-1.5 sm:shadow-[0_20px_60px_-30px_rgba(0,0,0,.5)]" : "grid gap-2.5")}>
        <label className={box(error?.field === "website")} htmlFor={`${id}-w`}>
          <Globe className={cn("size-[18px] shrink-0", dark && !inline ? "text-white/50" : "text-muted")} aria-hidden="true" />
          <span className="sr-only">Your website</span>
          <input id={`${id}-w`} name="website" required inputMode="url" autoComplete="url" autoCapitalize="none" spellCheck={false} placeholder={placeholder} className={input} autoFocus={autoFocus} />
        </label>
        {inline && <span className="hidden h-7 w-px bg-line sm:block" aria-hidden="true" />}
        <label className={box(error?.field === "email")} htmlFor={`${id}-e`}>
          <Mail className={cn("size-[18px] shrink-0", dark && !inline ? "text-white/50" : "text-muted")} aria-hidden="true" />
          <span className="sr-only">Your email</span>
          <input id={`${id}-e`} name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={input} />
        </label>
        {/* Honeypot */}
        <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <button disabled={state === "loading"} className={cn("btn btn-accent shrink-0 !py-4", inline ? "w-full sm:w-auto" : "w-full")}>
          {state === "loading" ? <Loader2 className="size-5 animate-spin" aria-label="Sending" /> : <>{buttonLabel} <ArrowRight className="size-4" /></>}
        </button>
      </div>
      {error && (
        <p role="alert" className={cn("mt-2.5 text-sm font-medium", dark ? "text-red-300" : "text-red-600")}>
          {error.text}
        </p>
      )}
    </form>
  );
}
