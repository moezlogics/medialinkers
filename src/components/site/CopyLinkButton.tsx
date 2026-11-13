"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {}
      }}
      aria-label={copied ? "Link copied" : "Copy link"}
      className="grid size-10 place-items-center rounded-full border border-line bg-white transition-colors hover:border-ink hover:bg-ink hover:text-white"
    >
      {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
    </button>
  );
}
