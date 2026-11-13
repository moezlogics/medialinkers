import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  (await draftMode()).disable();
  const referer = req.headers.get("referer");
  let path = "/";
  try {
    if (referer) path = new URL(referer).pathname;
  } catch {}
  return NextResponse.redirect(new URL(path, req.url), 303);
}
