import { useId } from "react";
import { cn } from "@/lib/utils";

/** Smooth path through the points (Catmull-Rom → cubic Bézier). */
function smooth(pts: [number, number][]) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const t = 0.18;
    const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/**
 * Lightweight growth chart (pure SVG, no chart library). The line draws itself when it
 * scrolls into view; the last point pulses to show "still growing".
 */
export default function TrendChart({
  points,
  color = "var(--accent-2)",
  className,
  showGrid = true,
  label,
}: {
  points: number[];
  color?: string;
  className?: string;
  showGrid?: boolean;
  label?: string;
}) {
  const id = useId().replace(/:/g, "");
  const clean = points.filter((n) => Number.isFinite(n));
  if (clean.length < 2) return null;
  const W = 400;
  const H = 160;
  const pad = 8;
  const max = Math.max(...clean);
  const min = Math.min(0, ...clean);
  const span = max - min || 1;
  const pts: [number, number][] = clean.map((v, i) => [pad + (i / (clean.length - 1)) * (W - pad * 2), H - pad - ((v - min) / span) * (H - pad * 2.6)]);
  const line = smooth(pts);
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${H} L${pts[0][0].toFixed(1)},${H} Z`;
  const last = pts[pts.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("block h-auto w-full overflow-visible", className)} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.38" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {showGrid && [0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />)}
      <path d={area} fill={`url(#g${id})`} className="chart-area" />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" pathLength={1} vectorEffect="non-scaling-stroke" className="chart-line" />
      <g className="chart-dot" style={{ transformOrigin: `${last[0]}px ${last[1]}px` }}>
        <circle cx={last[0]} cy={last[1]} r="9" fill={color} opacity="0.25" className="chart-ping" />
        <circle cx={last[0]} cy={last[1]} r="4.5" fill={color} stroke="#0b0b0f" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}
