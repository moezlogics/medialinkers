import Highlight from "./Highlight";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

export default function SectionHeading({
  eyebrow,
  title,
  text,
  align = "left",
  dark = false,
  className,
  action,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title?: string;
  text?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
  action?: React.ReactNode;
  as?: "h1" | "h2";
}) {
  if (!eyebrow && !title && !text) return null;
  return (
    <Reveal className={cn("mb-8 md:mb-10", align === "center" && "mx-auto max-w-3xl text-center", className)}>
      <div className={cn("flex flex-col gap-4", action && "md:flex-row md:items-end md:justify-between")}>
        <div className={cn(align === "center" ? "" : "max-w-3xl")}>
          {eyebrow && <p className={cn("eyebrow mb-3", dark ? "text-white/70" : "text-muted")}>{eyebrow}</p>}
          {title && (
            <Tag className={cn("text-3xl font-bold leading-[1.05] sm:text-4xl lg:text-5xl", dark ? "text-white" : "text-ink")}>
              <Highlight text={title} tone={dark ? "lime" : "accent"} />
            </Tag>
          )}
          {text && <p className={cn("mt-4 text-base leading-relaxed md:text-lg", dark ? "text-white/70" : "text-muted")}>{text}</p>}
        </div>
        {action}
      </div>
    </Reveal>
  );
}
