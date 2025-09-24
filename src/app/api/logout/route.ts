// src/app/api/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // overwrite + expire the token cookie
  res.cookies.set({
    name: "token",
    value: "",
    maxAge: 0,         // expire immediately
    path: "/",
    httpOnly: true,    // safe default (works even if your current cookie isn't httpOnly)
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
