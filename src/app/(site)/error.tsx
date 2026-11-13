"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="container-x flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="font-display text-4xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-muted">Please try again in a moment.</p>
      <div className="mt-6 flex gap-3">
        <button onClick={reset} className="btn btn-accent">Try again</button>
        <Link href="/" className="btn btn-outline">Home</Link>
      </div>
    </section>
  );
}
