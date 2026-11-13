"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Clock, UserCheck, X } from "lucide-react";
import AuditRequestForm from "./AuditRequestForm";

export const AUDIT_HASH = "#free-audit";

/**
 * Site-wide "free audit" popup. Any link to `#free-audit` opens it, so buttons in the
 * header, hero, CTAs and blog posts all lead to the same short form.
 */
export default function AuditDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const open = () => {
      const d = ref.current;
      if (!d || d.open) return;
      setKey((k) => k + 1); // fresh form each time
      d.showModal();
    };
    // Capture phase, so it runs before Next's <Link> handles the click
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!a || !a.getAttribute("href")?.endsWith(AUDIT_HASH)) return;
      e.preventDefault();
      e.stopPropagation();
      // Lets open menus close themselves
      window.dispatchEvent(new Event("ml:overlay"));
      open();
    };
    document.addEventListener("click", onClick, true);
    if (location.hash === AUDIT_HASH) {
      history.replaceState(null, "", location.pathname + location.search);
      open();
    }
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="audit-dialog-title"
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      className="audit-dialog m-auto w-[min(100%-1.5rem,34rem)] max-w-none overflow-visible rounded-[1.75rem] bg-transparent p-0 text-ink backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
    >
      <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-2xl">
        <div className="relative bg-ink px-6 pb-6 pt-7 text-white sm:px-8">
          <button type="button" onClick={() => ref.current?.close()} className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white" aria-label="Close">
            <X className="size-5" />
          </button>
          <p className="eyebrow text-white/55">Free · No obligation</p>
          <h2 id="audit-dialog-title" className="mt-2 pr-8 font-display text-[1.7rem] font-bold leading-[1.1] sm:text-3xl">
            Get a free SEO audit, <span className="text-lime">done by a human expert</span>
          </h2>
          <ul className="mt-4 grid gap-2 text-sm text-white/75 sm:grid-cols-3">
            <li className="flex items-center gap-1.5"><UserCheck className="size-4 text-lime" /> Manual review</li>
            <li className="flex items-center gap-1.5"><Clock className="size-4 text-lime" /> In 24 hours</li>
            <li className="flex items-center gap-1.5"><Check className="size-4 text-lime" /> Clear action plan</li>
          </ul>
        </div>
        <div className="px-6 py-6 sm:px-8">
          <AuditRequestForm key={key} layout="stack" autoFocus />
          <p className="mt-4 text-center text-xs text-muted">We’ll only use your email to send the audit. No spam, ever.</p>
        </div>
      </div>
    </dialog>
  );
}
