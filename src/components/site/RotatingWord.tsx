"use client";

import { useEffect, useState } from "react";

/** Pill that cycles through words with a slide-up animation (CSS only). */
export default function RotatingWord({ words, every = 2200 }: { words: string[]; every?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (words.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((v) => (v + 1) % words.length), every);
    return () => clearInterval(t);
  }, [words.length, every]);
  // The widest word reserves the space, so the line never jumps
  const longest = words.reduce((a, w) => (w.length > a.length ? w : a), "");
  return (
    <span className="relative inline-grid h-[1.35em] items-center overflow-hidden rounded-full bg-ink px-4 text-lime">
      <span className="invisible col-start-1 row-start-1" aria-hidden="true">{longest}</span>
      <span key={words[i]} className="word-in col-start-1 row-start-1 text-center">
        {words[i]}
      </span>
    </span>
  );
}
