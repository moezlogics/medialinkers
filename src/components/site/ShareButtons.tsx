import { Icon } from "@/lib/icons";
import CopyLinkButton from "./CopyLinkButton";

/** Share links render on the server; only the copy button needs JavaScript. */
export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { name: "WhatsApp", icon: "whatsapp", href: `https://wa.me/?text=${t}%20${u}` },
    { name: "Facebook", icon: "facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: "LinkedIn", icon: "linkedin", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: "X", icon: "x", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map((l) => (
        <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${l.name}`} className="grid size-10 place-items-center rounded-full border border-line bg-white transition-colors hover:border-ink hover:bg-ink hover:text-white">
          <Icon name={l.icon} className="size-4" />
        </a>
      ))}
      <CopyLinkButton url={url} />
    </div>
  );
}
