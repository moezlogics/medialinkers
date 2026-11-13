"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowUp } from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export default function FloatingActions({ whatsapp, showWhatsapp, showTop, whatsappIcon }: { whatsapp?: string; showWhatsapp: boolean; showTop: boolean; whatsappIcon?: ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const on = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > 600);
        ticking = false;
      });
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <>
      <div className="scroll-progress fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-accent" aria-hidden="true" />
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
        {showTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className={`grid size-11 place-items-center rounded-full border border-line bg-white text-ink shadow-lg transition-all duration-300 hover:bg-ink hover:text-white ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
          >
            <ArrowUp className="size-4" />
          </button>
        )}
        {showWhatsapp && whatsapp && (
          <a
            href={whatsappLink(whatsapp, "Hi Media Linkers, I'd like to know more about your services.")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="group relative grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-xl shadow-green-600/30 transition-transform hover:scale-105"
          >
            <span className="ping-soft absolute inset-0 rounded-full bg-[#25d366]" />
            <span className="relative size-7 [&>svg]:size-full">{whatsappIcon}</span>
          </a>
        )}
      </div>
    </>
  );
}
