import { splitHighlight } from "@/lib/utils";

/** Renders text where *starred* words get the brand highlight with a hand-drawn underline. */
export default function Highlight({ text, tone = "accent" }: { text?: string; tone?: "accent" | "lime" }) {
  if (!text) return null;
  return (
    <>
      {splitHighlight(text).map((p, i) =>
        p.hl ? (
          <span key={i} className={`relative inline-block whitespace-nowrap ${tone === "lime" ? "text-lime" : "text-accent"}`}>
            {p.text}
            <svg className="absolute -bottom-[0.12em] left-0 h-[0.28em] w-full" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
              <path d="M2 9 C 50 2, 120 2, 198 7" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity=".55" />
            </svg>
          </span>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}
