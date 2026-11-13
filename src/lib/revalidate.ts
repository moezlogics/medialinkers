import "server-only";
import { revalidatePath } from "next/cache";

/** Clear every cached public page after admin changes, so edits show immediately. */
export function revalidateSite() {
  try {
    revalidatePath("/", "layout");
  } catch (e) {
    console.error("revalidate failed", e);
  }
}
