import Highlight from "@/components/site/Highlight";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

export default function RichText({ data, ctx }: SectionProps) {
  if (!data.content && !data.title) return null;
  const H = ctx.headingAs;
  return (
    <section className="section">
      <div className={cn("container-x", data.width === "narrow" && "max-w-4xl")}>
        {data.eyebrow && <p className="eyebrow mb-3 text-muted">{data.eyebrow}</p>}
        {data.title && (
          <H className="mb-6 text-3xl font-bold leading-tight sm:text-4xl">
            <Highlight text={data.title} />
          </H>
        )}
        {data.content && <div className="rich prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: data.content }} />}
      </div>
    </section>
  );
}
