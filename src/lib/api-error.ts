import { NextResponse } from "next/server";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function errorResponse(e: any) {
  if (e?.code === 11000) {
    const field = Object.keys(e.keyPattern || {})[0] || "value";
    return NextResponse.json({ error: `This ${field} is already used. Please choose another.` }, { status: 409 });
  }
  if (e?.name === "ValidationError") {
    return NextResponse.json({ error: Object.values(e.errors).map((x: any) => x.message).join(", ") }, { status: 400 });
  }
  if (e?.name === "CastError") return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  return NextResponse.json({ error: e?.message || "Something went wrong" }, { status: 400 });
}
