// src/app/api/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyUserJWT } from "@/lib/auth";

export async function GET() {
  try {
    const jar = await cookies();
    const token =
      jar.get("token")?.value ||
      jar.get("auth_token")?.value ||
      jar.get("jwt")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const claims = await verifyUserJWT(token);

    const user = await prisma.users.findUnique({
      where: { id: BigInt(claims.userId) }, // users.id is UnsignedBigInt
      select: {
        id: true,
        name: true,
        email: true,
        profile: true,      // avatar URL string in your schema
        created_at: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    return NextResponse.json({
      id: Number(user.id),
      name: user.name ?? "User",
      email: user.email ?? "",
      avatarUrl: user.profile || null,
      loginAt: claims.loginAt || user.created_at?.toISOString() || null,
    });
  } catch (err) {
    console.error("GET /api/me", err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}
