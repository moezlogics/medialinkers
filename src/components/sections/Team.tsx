import Image from "next/image";
import SectionHeading from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { Icon } from "@/lib/icons";
import type { SectionProps } from "./types";

type Member = { name: string; role?: string; photo?: string; linkedin?: string };

export default function Team({ data, ctx }: SectionProps) {
  const items: Member[] = (data.items || []).filter((m: Member) => m.name);
  if (!items.length) return null;
  return (
    <section className="section">
      <div className="container-x">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} text={data.text} as={ctx.headingAs} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
          {items.map((m, i) => (
            <Reveal key={m.name} delay={(i % 4) * 0.06} className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-ink">
                {m.photo ? (
                  <Image src={m.photo} alt={m.name} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
                ) : (
                  <span className="grid size-full place-items-center font-display text-6xl font-bold text-white/20">{m.name.slice(0, 1)}</span>
                )}
                {m.linkedin && (
                  <a href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`} className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white text-ink transition-colors hover:bg-accent hover:text-white">
                    <Icon name="linkedin" className="size-4" />
                  </a>
                )}
              </div>
              <h3 className="mt-3 font-display text-lg font-bold">{m.name}</h3>
              {m.role && <p className="text-sm text-muted">{m.role}</p>}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
