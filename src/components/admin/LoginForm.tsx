"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, Lock } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const j = await res.json().catch(() => ({}));
    if (res.ok) {
      router.refresh();
    } else {
      setError(j.error || "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-dvh bg-ink lg:grid-cols-2">
      <div className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-32 -top-32 size-[520px] rounded-full bg-accent/40 blur-[120px]" />
        <div className="relative flex items-center gap-2">
          <span className="grid size-10 place-items-center rounded-full bg-white">
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true"><circle cx="7" cy="12" r="4" fill="none" stroke="#0b0b0f" strokeWidth="2.4" /><circle cx="17" cy="12" r="4" fill="none" stroke="#ff5a1f" strokeWidth="2.4" /></svg>
          </span>
          <span className="font-display text-xl font-bold">Media Linkers</span>
        </div>
        <div className="relative">
          <p className="font-display text-5xl font-extrabold leading-[1.05]">Manage every page, post and lead — <span className="text-accent">in one place.</span></p>
          <p className="mt-4 max-w-md text-white/60">Content, SEO, media and leads for medialinkers.pk.</p>
        </div>
        <p className="relative text-sm text-white/40">© {new Date().getFullYear()} Media Linkers</p>
      </div>
      <div className="flex items-center justify-center bg-[#f6f5f1] p-5 lg:rounded-l-[2.5rem]">
        <form onSubmit={submit} className="w-full max-w-sm">
          <span className="grid size-12 place-items-center rounded-2xl bg-ink text-white"><Lock className="size-5" /></span>
          <h1 className="mt-5 font-display text-3xl font-bold">Sign in</h1>
          <p className="mt-1 text-sm text-ink/55">Enter your admin credentials to continue.</p>
          <div className="mt-7 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email</label>
              <input id="email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-line bg-white px-4 py-3 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10" />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">Password</label>
              <div className="relative">
                <input id="password" type={show ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-line bg-white px-4 py-3 pr-11 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-ink/50 hover:bg-ink/5" aria-label={show ? "Hide password" : "Show password"}>
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-semibold text-white transition hover:brightness-95 disabled:opacity-60">
              {loading ? <Loader2 className="size-5 animate-spin" /> : <>Sign in <ArrowRight className="size-4" /></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
