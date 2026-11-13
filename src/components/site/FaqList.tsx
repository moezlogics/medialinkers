import { Plus } from "lucide-react";
import type { Faq } from "@/lib/types";

/** Native <details> accordion: content stays in the HTML for SEO and works without JavaScript. */
export default function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="space-y-2">
      {items.map((f, i) => (
        <details key={i} className="group rounded-[1.25rem] border border-line bg-white transition-colors open:border-ink open:shadow-sm" open={i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-display text-lg font-semibold leading-snug [&::-webkit-details-marker]:hidden">
            {f.q}
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-paper transition-all duration-300 group-open:rotate-45 group-open:bg-accent group-open:text-white">
              <Plus className="size-4" />
            </span>
          </summary>
          <div className="px-5 pb-5 leading-relaxed text-muted">{f.a}</div>
        </details>
      ))}
    </div>
  );
}
