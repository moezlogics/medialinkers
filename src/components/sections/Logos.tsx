import Image from "next/image";
import type { SectionProps } from "./types";

type Client = { name: string; logo?: string; url?: string };

export default function Logos({ data }: SectionProps<{ title?: string; items?: Client[] }>) {
  const items = (data.items || []).filter((c) => c.name || c.logo);
  if (!items.length) return null;
  const loop = [...items, ...items];
  return (
    <section className="border-y border-line bg-white py-6 md:py-8" aria-label={data.title || "Clients"}>
      <div className="container-x flex flex-col items-center gap-5 md:flex-row md:gap-8">
        {data.title && <p className="shrink-0 text-center text-sm font-semibold uppercase tracking-[0.16em] text-muted md:max-w-[150px] md:text-left">{data.title}</p>}
        <div className="marquee-mask marquee-pause relative w-full overflow-hidden">
          <ul className="animate-marquee flex w-max items-center gap-4 [--marquee-speed:40s]">
            {loop.map((c, i) => {
              const inner = c.logo ? (
                <Image src={c.logo} alt={`${c.name} logo`} width={160} height={48} className="h-9 w-auto max-w-[150px] object-contain opacity-70 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 md:h-11" />
              ) : (
                <span className="font-display text-lg font-bold text-ink/60 transition-colors group-hover:text-ink">{c.name}</span>
              );
              return (
                <li key={i} aria-hidden={i >= items.length ? true : undefined} className="group flex h-16 min-w-[170px] items-center justify-center rounded-2xl border border-line bg-paper/60 px-5">
                  {c.url ? (
                    <a href={c.url} target="_blank" rel="noopener noreferrer" tabIndex={i >= items.length ? -1 : undefined}>
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
