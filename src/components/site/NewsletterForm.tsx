"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "newsletter", email, sourcePage: location.pathname }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok) {
      setState("done");
      setMsg(j.message || "You're in! Check your inbox soon.");
      setEmail("");
    } else {
      setState("error");
      setMsg(j.error || "Something went wrong");
    }
  }

  return (
    <form onSubmit={submit} className="w-full">
      <label htmlFor="nl-email" className="sr-only">Email address</label>
      <div className="flex rounded-full bg-white/10 p-1.5 ring-1 ring-white/15 focus-within:ring-accent">
        <input
          id="nl-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="min-w-0 flex-1 bg-transparent px-4 text-white placeholder:text-white/40 focus:outline-none"
          autoComplete="email"
        />
        <button disabled={state === "loading"} className="btn btn-accent !px-4 !py-3" aria-label="Subscribe">
          {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : state === "done" ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
        </button>
      </div>
      {msg && <p className={`mt-2 text-sm ${state === "error" ? "text-red-300" : "text-lime"}`} role="status">{msg}</p>}
    </form>
  );
}
