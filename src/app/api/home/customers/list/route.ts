// src/app/api/home/customers/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

function toInt(v: string | null | undefined, d: number) {
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : d;
}

function like(q: string) {
  return { contains: q, mode: "insensitive" as const };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = toInt(searchParams.get("page"), 1);
    const limit = Math.min(toInt(searchParams.get("limit"), 20), 100);
    const q = (searchParams.get("search") || "").trim();
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");

    const createdFilter =
      start && end
        ? { gte: new Date(start), lte: new Date(end) }
        : start
        ? { gte: new Date(start) }
        : end
        ? { lte: new Date(end) }
        : undefined;

    // Use a mutable Prisma.usersWhereInput to avoid readonly OR issues
    const whereBase: Prisma.usersWhereInput = {
      OR: [
        { userRoles: { some: { roleId: 3 } } }, // keep your "customer" definition
        { userRoles: { none: {} } },
      ],
      isActive: true,
      isDelete: false,
      ...(createdFilter ? { created_at: createdFilter } : {}),
    };

    const where: Prisma.usersWhereInput = q
      ? {
          ...whereBase,
          OR: [
            { name: like(q) },
            { contactNo: like(q) }, // <- your schema field
            { email: like(q) },
            // ensure "customer" matches even if name/phone/email don't
            { userRoles: { some: { roleId: 3 } } },
          ],
        }
      : whereBase;

    const [total, items] = await Promise.all([
      prisma.users.count({ where }),
      prisma.users.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        // Select only fields that exist on your schema
        select: {
          id: true,
          name: true,
          contactNo: true, // <- will map to phone in response
          email: true,
          isActive: true,
          isDelete: true,
          created_at: true,
          // NOTE:
          // - Removed userRoles (relation name doesn't exist on users type you shared)
          // - Removed _count.user_reports (not present on UsersCountOutputTypeSelect)
        },
      }),
    ]);

    // BigInt → number/string safe mapping
    const safeItems = items.map((u) => ({
      id: typeof u.id === "bigint" ? Number(u.id) : u.id,
      name: u.name,
      phone: u.contactNo ?? null, // map to phone for frontend compatibility
      email: u.email,
      isActive: u.isActive,
      isDelete: u.isDelete,
      created_at: u.created_at,
      // roles and reports omitted because related fields were invalid in schema typings
      // If needed later, share exact relation field names on `users` and we’ll add them back.
    }));

    return NextResponse.json(
      {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        items: safeItems,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("customers/list error", err);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
