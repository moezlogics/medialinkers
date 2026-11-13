"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const BUDGETS = ["Under Rs. 50k / $200", "Rs. 50k – 150k", "Rs. 150k – 500k", "Rs. 500k+ / $2k+", "Not sure yet"];

export default function ContactForm({ services, title, type = "contact", defaultWebsite = "", defaultService = "", compact = false }: { services: string[]; title?: string; type?: "contact" | "quote"; defaultWebsite?: string; defaultService?: string; compact?: boolean }) {
  const sp = useSearchParams();
  const pkg = sp.get("package");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError("");
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fd, type: pkg ? "quote" : type, sourcePage: location.pathname + location.search }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok) {
      setState("done");
      // Conversion events for GA4 / Meta Pixel when installed
      const w = window as unknown as { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };
      w.gtag?.("event", "generate_lead", { form_type: type });
      w.fbq?.("track", "Lead");
    } else {
      setState("error");
      setError(j.error || "Something went wrong. Please try again.");
    }
  }

  if (state === "done") {
    return (
      <div role="status" className="anim-pop flex flex-col items-center justify-center rounded-[1.75rem] bg-white p-10 text-center">
        <CheckCircle2 className="size-14 text-accent" />
        <p className="mt-4 font-display text-2xl font-bold">Thank you! 🎉</p>
        <p className="mt-2 max-w-sm text-muted">We’ve received your message. A strategist will get back to you within one business day.</p>
      </div>
    );
  }

  const field = "w-full rounded-2xl border border-line bg-paper/60 px-4 py-3.5 text-[15px] transition-colors placeholder:text-muted/70 focus:border-ink focus:bg-white focus:outline-none";
  const defaultMessage = pkg ? `Hi, I'm interested in the ${pkg} package for ${sp.get("service") || "your services"}.` : "";

  return (
    <form onSubmit={submit} className={cn("rounded-[1.75rem] bg-white p-5 sm:p-7", !compact && "shadow-[0_30px_80px_-40px_rgba(0,0,0,.35)]")}>
      {title && <p className="mb-5 font-display text-2xl font-bold">{title}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="mb-1.5 block text-sm font-medium">Name *</label>
          <input id="cf-name" name="name" required autoComplete="name" className={field} placeholder="Your full name" />
        </div>
        <div>
          <label htmlFor="cf-email" className="mb-1.5 block text-sm font-medium">Email *</label>
          <input id="cf-email" name="email" type="email" required autoComplete="email" className={field} placeholder="you@company.com" />
        </div>
        <div>
          <label htmlFor="cf-phone" className="mb-1.5 block text-sm font-medium">Contact number *</label>
          <input id="cf-phone" name="phone" type="tel" required autoComplete="tel" className={field} placeholder="+92 3xx xxxxxxx" />
        </div>
        <div>
          <label htmlFor="cf-website" className="mb-1.5 block text-sm font-medium">Website</label>
          <input id="cf-website" name="website" defaultValue={defaultWebsite} className={field} placeholder="yourwebsite.com" inputMode="url" />
        </div>
        {!compact && (
          <>
            <div>
              <label htmlFor="cf-service" className="mb-1.5 block text-sm font-medium">Service</label>
              <select id="cf-service" name="service" defaultValue={sp.get("service") || defaultService} className={field}>
                <option value="">Select a service</option>
                {services.map((s) => <option key={s} value={s}>{s}</option>)}
                <option value="Not sure">Not sure yet</option>
              </select>
            </div>
            <div>
              <label htmlFor="cf-budget" className="mb-1.5 block text-sm font-medium">Monthly budget</label>
              <select id="cf-budget" name="budget" defaultValue="" className={field}>
                <option value="">Select budget</option>
                {BUDGETS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
          </>
        )}
        <div className="sm:col-span-2">
          <label htmlFor="cf-message" className="mb-1.5 block text-sm font-medium">Message {compact ? "" : "*"}</label>
          <textarea id="cf-message" name="message" required={!compact} rows={compact ? 3 : 4} defaultValue={defaultMessage} className={field} placeholder="Tell us about your goals…" />
        </div>
        {/* Honeypot */}
        <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      </div>
      {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
      <button disabled={state === "loading"} className="btn btn-accent mt-5 w-full !py-4 text-base">
        {state === "loading" ? <Loader2 className="size-5 animate-spin" /> : <>Send message <ArrowUpRight className="size-5" /></>}
      </button>
      <p className="mt-3 text-center text-xs text-muted">We reply within one business day. Your details stay private.</p>
    </form>
  );
}
