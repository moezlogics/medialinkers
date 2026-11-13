import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

/** Guards the admin panel (/newlogin/*) and admin APIs before they render. */
export async function proxy(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/newlogin";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/newlogin/:path+", "/api/admin/:path*"],
};
