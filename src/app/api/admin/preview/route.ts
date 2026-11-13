import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

/** Turns on Draft Mode for a signed-in admin and opens the requested page, drafts included. */
export async function GET(req: Request) {
  const g = await requireUser();
  if (g.error) return g.error;
  const path = new URL(req.url).searchParams.get("path") || "/";
  // Only same-site paths: never redirect to another domain
  const safe = path.startsWith("/") && !path.startsWith("//") && !path.includes("\\") ? path : "/";
  (await draftMode()).enable();
  redirect(safe);
}
