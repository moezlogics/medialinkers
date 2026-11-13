import Highlight from "@/components/site/Highlight";
import type { SectionProps } from "./types";

export default function Embed({ data, ctx }: SectionProps) {
  if (!data.code) return null;
  const H = ctx.headingAs;
  return (
    <section className="section">
      <div className="container-x">
        {data.title && (
          <H className="mb-6 text-3xl font-bold sm:text-4xl">
            <Highlight text={data.title} />
          </H>
        )}
        {/* Trusted HTML entered by an admin */}
        <div className="overflow-hidden rounded-[1.5rem] [&_iframe]:w-full" dangerouslySetInnerHTML={{ __html: data.code }} />
      </div>
    </section>
  );
}
