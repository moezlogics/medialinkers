import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import Scene3D from "@/components/three/Scene3D";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <Scene3D variant="corner" />
      <div className="container-x relative flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
        <p className="h-display text-[9rem] leading-none text-stroke sm:text-[14rem]">404</p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">This page took a wrong turn</h1>
        <p className="mt-4 max-w-md text-muted">The page you’re looking for doesn’t exist or has moved. Let’s get you back on track.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-accent">Back to home <ArrowUpRight className="size-4" /></Link>
          <Link href="/services" className="btn btn-outline">Our services</Link>
          <a href="#free-audit" className="btn btn-outline"><Search className="size-4" /> Free SEO audit</a>
        </div>
      </div>
    </section>
  );
}
