/** Shown only to admins who opened the site through "Preview" in the panel. */
export default function PreviewBanner() {
  return (
    <div className="relative z-[80] flex flex-wrap items-center justify-center gap-3 bg-amber-400 px-4 py-2 text-center text-sm font-semibold text-ink print:hidden" role="status">
      <span>👀 Preview mode — you are seeing drafts and unpublished changes.</span>
      <form action="/api/preview/exit" method="post">
        <button className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white hover:bg-ink/80">Exit preview</button>
      </form>
    </div>
  );
}
