"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ---------------- API helper ---------------- */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function api<T = any>(url: string, opts: { method?: string; body?: unknown; silent?: boolean } = {}): Promise<T> {
  const res = await fetch(url, {
    method: opts.method || (opts.body ? "POST" : "GET"),
    headers: opts.body ? { "Content-Type": "application/json" } : undefined,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });
  const j = await res.json().catch(() => ({}));
  if (res.status === 401) {
    window.location.href = "/newlogin";
    throw new Error("Session expired");
  }
  if (!res.ok) {
    if (!opts.silent) toast.error(j.error || "Request failed");
    throw new Error(j.error || "Request failed");
  }
  return j as T;
}

/* ---------------- Primitives ---------------- */

export function Button({
  children, variant = "primary", size = "md", loading, className, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "dark" | "ghost" | "outline" | "danger"; size?: "sm" | "md"; loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60",
        size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2.5 text-sm",
        variant === "primary" && "bg-accent text-white hover:brightness-95",
        variant === "dark" && "bg-ink text-white hover:bg-ink/85",
        variant === "ghost" && "text-ink hover:bg-ink/5",
        variant === "outline" && "border border-line bg-white text-ink hover:border-ink/30 hover:bg-ink/[0.02]",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        className,
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export const inputCls =
  "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink transition-colors placeholder:text-ink/35 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10";

export function Field({ label, help, children, className, counter }: { label?: string; help?: ReactNode; children: ReactNode; className?: string; counter?: ReactNode }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || counter) && (
        <div className="flex items-center justify-between gap-2">
          {label && <label className="text-[13px] font-semibold text-ink/80">{label}</label>}
          {counter}
        </div>
      )}
      {children}
      {help && <p className="text-xs leading-relaxed text-ink/50">{help}</p>}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={cn(inputCls, "resize-y", props.className)} />;
}

export function Select({ options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  return (
    <select {...props} className={cn(inputCls, "pr-8", props.className)}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function Switch({ checked, onChange, label, help }: { checked: boolean; onChange: (v: boolean) => void; label?: string; help?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-accent" : "bg-ink/15")}
      >
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
      </button>
      {(label || help) && (
        <span>
          {label && <span className="block text-sm font-medium">{label}</span>}
          {help && <span className="block text-xs text-ink/50">{help}</span>}
        </span>
      )}
    </label>
  );
}

export function Card({ children, className, title, actions, description }: { children: ReactNode; className?: string; title?: ReactNode; actions?: ReactNode; description?: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-line bg-white", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 sm:px-5">
          <div>
            {title && <h3 className="font-display text-base font-bold">{title}</h3>}
            {description && <p className="text-xs text-ink/50">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

export function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "green" | "amber" | "red" | "blue" | "accent" | "purple" }) {
  const t = {
    gray: "bg-ink/5 text-ink/70",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-sky-100 text-sky-700",
    accent: "bg-accent/10 text-accent",
    purple: "bg-violet-100 text-violet-700",
  }[tone];
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", t)}>{children}</span>;
}

export function Modal({ open, onClose, title, children, size = "md", footer }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; size?: "sm" | "md" | "lg" | "xl"; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", on);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", on);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl",
          size === "sm" && "sm:max-w-md",
          size === "md" && "sm:max-w-2xl",
          size === "lg" && "sm:max-w-4xl",
          size === "xl" && "sm:max-w-6xl",
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-full hover:bg-ink/5" aria-label="Close"><X className="size-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: ReactNode }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn("whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors", active === t.id ? "bg-ink text-white" : "bg-white text-ink/70 ring-1 ring-line hover:text-ink")}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function PageHeader({ title, description, actions, back }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; back?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back}
        <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink/55">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Empty({ icon, title, text, action }: { icon?: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink/15 bg-white px-6 py-12 text-center">
      {icon && <div className="mb-3 text-ink/30">{icon}</div>}
      <p className="font-display text-lg font-bold">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-ink/55">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function confirmAction(message: string) {
  return window.confirm(message);
}

export function CharCounter({ value, min, max }: { value: string; min: number; max: number }) {
  const n = value?.length || 0;
  const tone = n === 0 ? "text-ink/40" : n < min || n > max ? "text-amber-600" : "text-green-600";
  return <span className={cn("text-xs font-semibold tabular-nums", tone)}>{n} / {max}</span>;
}
