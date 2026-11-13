"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Animated number: "+400%" counts 0 → 400 keeping the prefix/suffix.
 * The real value is in the HTML (good for SEO and no-JS); it only animates once seen.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    const m = String(value).match(/^([^\d]*)([\d.,]+)(.*)$/);
    if (!el || !m || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = parseFloat(m[2].replace(/,/g, ""));
    // Years like 2008 shouldn't count up
    if (!target || (target >= 1900 && target <= 2100 && !m[1] && !m[3])) return;
    const decimals = m[2].includes(".") ? m[2].split(".")[1].length : 0;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / 1400);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(`${m[1]}${(target * eased).toFixed(decimals)}${m[3]}`);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

/** Element that gently follows the cursor (mouse only, CSS-driven). */
export function Magnetic({ children, className, strength = 0.3 }: { children: ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (x: number, y: number) => {
    if (ref.current) ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{ transition: "transform .35s cubic-bezier(.22,1,.36,1)" }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        move((e.clientX - r.left - r.width / 2) * strength, (e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => move(0, 0)}
    >
      {children}
    </div>
  );
}
