// src/app/api/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });

  // Clear common cookie names you may have used
  ["token", "auth_token", "jwt"].forEach((name) => {
    res.cookies.set({
      name,
      value: "",
      maxAge: 0,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  });

  return res;
}
