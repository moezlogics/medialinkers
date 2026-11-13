"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { FRAG, MAX_SHAPES, VERT } from "./shapes-shader";
import { computeShapes, layoutFor, type SceneTheme, type SceneVariant } from "./layouts";

export type { SceneTheme, SceneVariant };

type Nav = Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
type IdleWindow = Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };

/**
 * Decorative 3D background: a few pearl/silver shapes that float, slowly turn and morph.
 *
 * Built to never slow the page down:
 * - nothing happens until the section is close to the viewport (no WebGL, no shader compile)
 * - setup waits for an idle moment and compiles the shader in the background where supported
 * - pauses off screen and in background tabs, lowers resolution on slow devices
 * - one still frame for reduced-motion / data-saver users
 */
export default function Scene3D({ variant = "hero", theme = "default", className }: { variant?: SceneVariant; theme?: SceneTheme; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv) return;

    const nav = navigator as Nav;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches || !!nav.connection?.saveData;
    const lowEnd = (nav.deviceMemory ?? 8) <= 2 || (navigator.hardwareConcurrency || 8) <= 2;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const w = window as IdleWindow;

    let disposed = false;
    let started = false;
    let visible = false;
    let raf = 0;
    let idle = 0;
    let cleanupGl: (() => void) | null = null;
    // Replaced by setup() with the real "resume animation" function
    let start = () => {};

    // Everything WebGL lives in here and only runs once the section is near the screen
    const setup = () => {
      if (disposed || started) return;
      started = true;
      const gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
      if (!gl || gl.isContextLost()) return;
      const par = gl.getExtension("KHR_parallel_shader_compile");

      const sh = (type: number, src: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };
      const vs = sh(gl.VERTEX_SHADER, VERT);
      const fs = sh(gl.FRAGMENT_SHADER, FRAG);
      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);

      const buf = gl.createBuffer();
      const shapes = new Float32Array(MAX_SHAPES * 12);
      let u: Record<"res" | "s" | "n" | "dark" | "shadow", WebGLUniformLocation | null> | null = null;
      let width = 1;
      let height = 1;
      let dpr = Math.min(window.devicePixelRatio || 1, lowEnd ? 1 : 1.5);
      let layout = layoutFor(variant, 1, false, theme);

      const resize = () => {
        const r = el.getBoundingClientRect();
        width = Math.max(1, r.width);
        height = Math.max(1, r.height);
        const compact = window.innerWidth < 768;
        if (compact) dpr = Math.min(dpr, 1.25);
        cv.width = Math.round(width * dpr);
        cv.height = Math.round(height * dpr);
        gl.viewport(0, 0, cv.width, cv.height);
        layout = layoutFor(variant, width / height, compact, theme);
      };

      // Program is ready once compiled; with the extension this is checked without blocking
      const linked = () => {
        if (u) return true;
        if (par && !gl.getProgramParameter(prog, 0x91b1 /* COMPLETION_STATUS_KHR */)) return false;
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
          console.warn("3D shapes shader:", gl.getShaderInfoLog(fs) || gl.getProgramInfoLog(prog));
          return null;
        }
        gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const aPos = gl.getAttribLocation(prog, "aPos");
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        u = {
          res: gl.getUniformLocation(prog, "uRes"),
          s: gl.getUniformLocation(prog, "uS"),
          n: gl.getUniformLocation(prog, "uN"),
          dark: gl.getUniformLocation(prog, "uDark"),
          shadow: gl.getUniformLocation(prog, "uShadow"),
        };
        return true;
      };

      // Gentle parallax: shapes drift slightly away from the cursor
      const ptr: [number, number] = [0, 0];
      const target: [number, number] = [0, 0];
      const onMove = (e: PointerEvent) => {
        target[0] = (e.clientX / window.innerWidth) * 2 - 1;
        target[1] = -((e.clientY / window.innerHeight) * 2 - 1);
      };
      if (finePointer && !still) window.addEventListener("pointermove", onMove, { passive: true });

      let last = performance.now();
      let time = Math.random() * 100;
      let frames = 0;
      let slow = 0;
      let first = true;
      let skip = false;

      const draw = (now: number) => {
        const ok = linked();
        if (ok === null) return false;
        if (!ok || !u) return true; // still compiling in the background
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        time += dt;

        // Drop resolution once if the device struggles
        frames++;
        if (dt > 0.028) slow++;
        if (frames === 90 && slow > 45 && dpr > 1) {
          dpr = 1;
          resize();
        }
        if (layout.parallax) {
          const ease = 1 - Math.pow(0.05, dt);
          ptr[0] += (target[0] - ptr[0]) * ease;
          ptr[1] += (target[1] - ptr[1]) * ease;
        }
        const n = computeShapes(layout, time, layout.parallax ? ptr : [0, 0], shapes);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(u.res, cv.width, cv.height);
        gl.uniform4fv(u.s, shapes);
        gl.uniform1f(u.n, n);
        gl.uniform1f(u.dark, layout.dark);
        gl.uniform1f(u.shadow, layout.shadow);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        if (first) {
          first = false;
          setReady(true);
        }
        return true;
      };

      const loop = (now: number) => {
        raf = 0;
        // Low-end devices render every other frame (~30fps): still smooth for slow motion
        skip = lowEnd ? !skip : false;
        const alive = skip ? true : draw(now);
        if (!alive) return;
        if (!u || (visible && !still)) raf = requestAnimationFrame(loop);
      };
      start = () => {
        if (raf || disposed) return;
        last = performance.now();
        raf = requestAnimationFrame(loop);
      };

      const ro = new ResizeObserver(() => {
        resize();
        if (still && u) draw(performance.now());
      });
      ro.observe(el);
      resize();

      const onLost = (e: Event) => {
        e.preventDefault();
        cancelAnimationFrame(raf);
        raf = 0;
        setReady(false);
      };
      cv.addEventListener("webglcontextlost", onLost);

      cleanupGl = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        cv.removeEventListener("webglcontextlost", onLost);
        // The context is reused if the effect runs again (React dev mode runs effects twice),
        // so only free our own GPU objects here
        gl.deleteBuffer(buf);
        gl.deleteProgram(prog);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
      };
      start();
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting && !document.hidden;
        if (!visible) return;
        if (!started) {
          if (w.requestIdleCallback) idle = w.requestIdleCallback(setup, { timeout: 1500 });
          else idle = window.setTimeout(setup, 200);
        } else start();
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);

    const onVis = () => {
      visible = !document.hidden && visible;
      if (!document.hidden) {
        const r = el.getBoundingClientRect();
        visible = r.bottom > -200 && r.top < window.innerHeight + 200;
        if (visible) start();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      disposed = true;
      if (w.cancelIdleCallback) w.cancelIdleCallback(idle);
      clearTimeout(idle);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      cleanupGl?.();
    };
  }, [variant, theme]);

  return (
    <div ref={wrap} aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      <canvas ref={canvas} className={cn("absolute inset-0 size-full transition-opacity duration-1000 ease-out", ready ? "opacity-100" : "opacity-0")} />
    </div>
  );
}
