import Image from "next/image";
import { cn } from "@/lib/utils";

/** Website screenshot inside a minimal browser window. */
export function BrowserFrame({ src, alt, url, sizes = "(min-width:1024px) 60vw, 100vw", className, priority, imgClassName }: { src: string; alt: string; url?: string; sizes?: string; className?: string; priority?: boolean; imgClassName?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl bg-white shadow-[0_30px_70px_-30px_rgba(0,0,0,.55)] ring-1 ring-black/10", className)}>
      <div className="flex items-center gap-2 border-b border-black/5 bg-[#f3f2ef] px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        {url && <span className="mx-auto max-w-[70%] truncate rounded-md bg-white px-3 py-0.5 text-center text-[11px] text-ink/60">{url}</span>}
      </div>
      <div className={cn("relative aspect-[16/10] overflow-hidden bg-paper", imgClassName)}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover object-top" />
      </div>
    </div>
  );
}

/** Mobile screenshot inside a phone shape. */
export function PhoneFrame({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cn("rounded-[2.2rem] bg-ink p-2 shadow-[0_30px_70px_-30px_rgba(0,0,0,.6)] ring-1 ring-white/10", className)}>
      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[1.7rem] bg-paper">
        <Image src={src} alt={alt} fill sizes="(min-width:1024px) 22vw, 60vw" className="object-cover object-top" />
        <span className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-ink" aria-hidden="true" />
      </div>
    </div>
  );
}

export function domainOf(url?: string) {
  return (url || "").replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}
