import Link from "next/link";

export default function RootNotFound() {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <p className="font-display text-7xl font-extrabold">404</p>
        <p className="mt-2 text-muted">Page not found.</p>
        <Link href="/" className="btn btn-dark mt-6">Go home</Link>
      </div>
    </main>
  );
}
