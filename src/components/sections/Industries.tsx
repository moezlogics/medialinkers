import SectionHeading from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { Icon } from "@/lib/icons";
import type { SectionProps } from "./types";

type Ind = { title: string; icon?: string };

export default function Industries({ data, ctx }: SectionProps) {
  const items: Ind[] = (data.items || []).filter((i: Ind) => i.title);
  if (!items.length) return null;
  return (
    <section className="section bg-white">
      <div className="container-x">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} text={data.text} align="center" as={ctx.headingAs} />
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-5">
          {items.map((it, i) => (
            <Reveal as="li" key={it.title} delay={(i % 5) * 0.05}>
              <div className="group flex items-center gap-3 rounded-full border border-line bg-paper p-1.5 pr-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-white">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-ink transition-all duration-500 group-hover:rotate-[360deg] group-hover:bg-accent group-hover:text-white">
                  <Icon name={it.icon || "briefcase"} className="size-5" />
                </span>
                <span className="text-sm font-semibold md:text-[15px]">{it.title}</span>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
