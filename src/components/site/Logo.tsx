import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Logo({ src, name, dark = false, className }: { src?: string; name: string; dark?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label={`${name} home`} className={cn("group inline-flex items-center gap-2", className)}>
      {src ? (
        <Image src={src} alt={name} width={160} height={40} className="h-9 w-auto object-contain" priority />
      ) : (
        <>
          <span className={cn("relative grid size-9 place-items-center rounded-full transition-transform duration-500 group-hover:rotate-[360deg]", dark ? "bg-white text-ink" : "bg-ink text-white")}>
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
              <circle cx="7" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2.4" />
              <circle cx="17" cy="12" r="4" fill="none" stroke="var(--accent)" strokeWidth="2.4" />
            </svg>
          </span>
          <span className={cn("font-display text-xl font-bold tracking-tight", dark ? "text-white" : "text-ink")}>
            {name.split(" ")[0]}
            <span className="text-accent">{name.split(" ").slice(1).join(" ") ? " " + name.split(" ").slice(1).join(" ") : ""}</span>
          </span>
        </>
      )}
    </Link>
  );
}
