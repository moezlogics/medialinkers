import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll reveal using CSS scroll-driven animations. Content is always visible;
 * browsers that support `animation-timeline: view()` add the slide-in effect.
 */
export function Reveal({ children, delay = 0, className, as: Tag = "div" }: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "li" | "article" | "section" }) {
  return (
    <Tag className={cn("reveal", className)} style={delay ? ({ "--reveal-delay": `${Math.round(delay * 100)}px` } as React.CSSProperties) : undefined}>
      {children}
    </Tag>
  );
}
