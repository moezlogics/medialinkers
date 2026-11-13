import { MAX_SHAPES, SHAPE } from "./shapes-shader";

export type SceneVariant = "hero" | "page" | "orbit" | "dark" | "corner";

/** Which family of shapes a section uses, so the 3D matches what the section is about. */
export type SceneTheme =
  | "default" | "seo" | "local" | "ai" | "social" | "content" | "web" | "ads" | "analytics" | "audit" | "work" | "contact";

const S = SHAPE;

/** Morph sequences per theme; slot i of a layout takes sequence i (wrapping). */
const THEMES: Record<SceneTheme, number[][]> = {
  // Pixel-wallpaper geometry: circles, half/quarter circles, pills and rounded squares
  default: [[S.circle, S.squircle, S.half], [S.pill, S.quarter], [S.half, S.circle, S.arch], [S.squircle, S.pill]],
  seo: [[S.ring, S.arrow], [S.bars, S.star], [S.arrow, S.ring], [S.star, S.bars]],
  local: [[S.pin, S.ring], [S.star, S.pin], [S.ring, S.star], [S.pin, S.check]],
  ai: [[S.sparkle, S.bubble], [S.ring, S.sparkle], [S.bubble, S.star], [S.sparkle, S.ring]],
  social: [[S.heart, S.bubble], [S.play, S.heart], [S.bubble, S.star], [S.star, S.play]],
  content: [[S.bubble, S.pill], [S.sparkle, S.check], [S.pill, S.bubble], [S.check, S.sparkle]],
  web: [[S.code, S.squircle], [S.squircle, S.play], [S.plus, S.code], [S.check, S.squircle]],
  ads: [[S.ring, S.plus], [S.arrow, S.bars], [S.plus, S.ring], [S.bars, S.arrow]],
  analytics: [[S.bars, S.ring], [S.arrow, S.bars], [S.ring, S.check], [S.check, S.arrow]],
  audit: [[S.ring, S.check], [S.check, S.sparkle], [S.bars, S.ring], [S.sparkle, S.check]],
  work: [[S.arrow, S.star], [S.bars, S.arrow], [S.star, S.check], [S.check, S.bars]],
  contact: [[S.bubble, S.heart], [S.pin, S.bubble], [S.heart, S.check], [S.check, S.pin]],
};

/** Maps a service slug (or its main service slug) to a theme. */
export function themeForService(slug = "", parentSlug = ""): SceneTheme {
  if (/local/.test(slug)) return "local";
  if (/(^|-)ai-|aeo|geo/.test(slug)) return "ai";
  const s = `${parentSlug} ${slug}`;
  if (/social|facebook|instagram|tiktok|linkedin/.test(s)) return "social";
  if (/content|writing|blog|copy/.test(s)) return "content";
  if (/web|wordpress|landing|design|development/.test(s)) return "web";
  if (/ppc|ads|google-ads|shopping|remarketing/.test(s)) return "ads";
  if (/analytic|report/.test(s)) return "analytics";
  if (/seo/.test(s)) return "seo";
  return "default";
}

/** Maps a page slug to a theme for its hero. */
export function themeForPage(slug = ""): SceneTheme {
  if (/contact/.test(slug)) return "contact";
  if (/case|work/.test(slug)) return "work";
  if (/blog|faq/.test(slug)) return "content";
  if (/smm|social/.test(slug)) return "social";
  if (/seo|pricing/.test(slug)) return "seo";
  return "default";
}

/**
 * Coordinates: y runs -1..1 (bottom..top), x runs -aspect..aspect,
 * so placement follows the real size of the section on every screen.
 */
type Item = {
  x: number;
  y: number;
  scale: number;
  /** Slot in the theme's sequence list */
  slot: number;
  seed: number;
  /** Depth for pointer parallax: 0 = still, 1 = moves most */
  depth: number;
};

export type Layout = { items: (Omit<Item, "slot"> & { seq: number[] })[]; orbit?: { radius: number; scale: number; seq: number[][] }; shadow: number; dark: number; parallax: boolean };

export function layoutFor(variant: SceneVariant, a: number, compact: boolean, theme: SceneTheme = "default"): Layout {
  const sets = THEMES[theme] || THEMES.default;
  const withSeq = (items: Item[]) => items.map(({ slot, ...it }) => ({ ...it, seq: sets[slot % sets.length] }));
  // On phones shapes sit half off the screen edges so they frame the text instead of covering it
  const m = compact ? Math.min(1, Math.max(0.55, a * 1.6)) : 1;
  switch (variant) {
    case "hero":
      return {
        items: withSeq(
          compact
            ? [
                { x: a * 1.0, y: 0.26, scale: 0.2 * m, slot: 0, seed: 1, depth: 0.6 },
                { x: -a * 1.0, y: -0.5, scale: 0.17 * m, slot: 2, seed: 3, depth: 0.8 },
              ]
            : [
                { x: a * 0.84, y: 0.4, scale: 0.27, slot: 0, seed: 1, depth: 0.7 },
                { x: -a * 0.87, y: 0.46, scale: 0.18, slot: 1, seed: 2, depth: 1 },
                { x: -a * 0.8, y: -0.46, scale: 0.24, slot: 2, seed: 3, depth: 0.6 },
                { x: a * 0.74, y: -0.52, scale: 0.14, slot: 3, seed: 4, depth: 1 },
              ],
        ),
        shadow: 0.1,
        dark: 0,
        parallax: !compact,
      };
    case "page":
      return {
        items: withSeq(
          compact
            ? [{ x: a * 1.0, y: 0.35, scale: 0.2 * m, slot: 0, seed: 5, depth: 0.6 }]
            : [
                { x: a * 0.74, y: 0.22, scale: 0.28, slot: 0, seed: 5, depth: 0.7 },
                { x: a * 0.55, y: -0.48, scale: 0.15, slot: 1, seed: 6, depth: 1 },
              ],
        ),
        shadow: 0.1,
        dark: 0,
        parallax: !compact,
      };
    case "corner":
      // Two small shapes tucked into opposite corners, mostly outside the content
      return {
        items: withSeq(
          compact
            ? [{ x: a * 1.02, y: 0.82, scale: 0.15 * m, slot: 0, seed: 9, depth: 0.6 }]
            : [
                { x: a * 0.95, y: 0.72, scale: 0.17, slot: 0, seed: 9, depth: 0.7 },
                { x: -a * 0.97, y: -0.7, scale: 0.13, slot: 1, seed: 10, depth: 1 },
              ],
        ),
        shadow: 0.08,
        dark: 0,
        parallax: !compact,
      };
    case "dark":
      return {
        items: withSeq(
          compact
            ? [{ x: a * 1.0, y: 0.55, scale: 0.22 * m, slot: 0, seed: 7, depth: 0.6 }]
            : [
                { x: a * 0.6, y: 0.4, scale: 0.26, slot: 0, seed: 7, depth: 0.7 },
                { x: a * 0.9, y: -0.35, scale: 0.3, slot: 1, seed: 8, depth: 0.9 },
              ],
        ),
        shadow: 0,
        dark: 1,
        parallax: !compact,
      };
    case "orbit":
    default:
      return {
        items: [],
        orbit: { radius: 0.74, scale: 0.13, seq: [0, 1, 2, 3].map((i) => sets[i % sets.length]) },
        shadow: 0.08,
        dark: 0,
        parallax: false,
      };
  }
}

const MORPH_EVERY = 7; // seconds a shape holds before morphing
const MORPH_TIME = 1.6;

function morph(seq: number[], t: number, offset: number) {
  if (seq.length < 2) return { a: seq[0], b: seq[0], m: 0 };
  const phase = (t + offset) / MORPH_EVERY;
  const k = Math.floor(phase);
  const local = (phase - k) * MORPH_EVERY;
  const x = Math.min(1, Math.max(0, (local - (MORPH_EVERY - MORPH_TIME)) / MORPH_TIME));
  return { a: seq[k % seq.length], b: seq[(k + 1) % seq.length], m: x * x * (3 - 2 * x) };
}

/** Fills `out` with this frame's shapes (3 × vec4 each) and returns how many there are. */
export function computeShapes(layout: Layout, t: number, ptr: [number, number], out: Float32Array) {
  let n = 0;
  const push = (x: number, y: number, z: number, s: number, rx: number, ry: number, rz: number, mo: { a: number; b: number; m: number }) => {
    if (n >= MAX_SHAPES) return;
    out.set([x, y, z, s, rx, ry, rz, mo.m, mo.a, mo.b, 0, 0], n * 12);
    n++;
  };

  for (const it of layout.items) {
    const ph = it.seed * 1.9;
    // Slow drift, gentle tilt and a small sway — symbols stay readable, never spin wildly
    const x = it.x + 0.05 * Math.sin(t * 0.35 + ph) - ptr[0] * 0.05 * it.depth;
    const y = it.y + 0.06 * Math.cos(t * 0.3 + ph * 1.3) - ptr[1] * 0.05 * it.depth;
    push(x, y, 0, it.scale, 0.4 * Math.sin(t * 0.28 + ph), 0.5 * Math.cos(t * 0.22 + ph), 0.35 * Math.sin(t * 0.17 + ph), morph(it.seq, t, it.seed * 2.3));
  }

  if (layout.orbit) {
    const { radius, scale, seq } = layout.orbit;
    seq.forEach((s, j) => {
      const ang = (j / seq.length) * Math.PI * 2 + t * 0.18;
      push(Math.cos(ang) * radius, Math.sin(ang) * radius, 0, scale, 0.45 * Math.sin(t * 0.4 + j), 0.5 * Math.cos(t * 0.35 + j), 0.3 * Math.sin(t * 0.3 + j), morph(s, t, j * 1.7));
    });
  }
  return n;
}
