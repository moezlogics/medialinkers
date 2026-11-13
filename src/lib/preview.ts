import "server-only";
import { draftMode } from "next/headers";

/** True when an admin opened the page through "Preview" (Next.js Draft Mode). */
export async function isPreview() {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}
