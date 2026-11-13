import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Breadcrumbs({ items, dark = false }: { items: { name: string; path: string }[]; dark?: boolean }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={cn("flex flex-wrap items-center gap-1 text-sm", dark ? "text-white/60" : "text-muted")}>
        {items.map((c, i) => (
          <li key={c.path + i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 opacity-60" aria-hidden="true" />}
            {i < items.length - 1 ? (
              <Link href={c.path} className={cn("hover:underline", dark ? "hover:text-white" : "hover:text-ink")}>{c.name}</Link>
            ) : (
              <span aria-current="page" className={cn("font-medium", dark ? "text-white" : "text-ink")}>{c.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
