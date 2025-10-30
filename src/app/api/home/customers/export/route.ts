// src/app/api/home/customers/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

function like(q: string) {
  return { contains: q, mode: "insensitive" as const };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("search") || "").trim();
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");

    const createdFilter: Prisma.usersWhereInput["created_at"] =
      start && end
        ? { gte: new Date(start), lte: new Date(end) }
        : start
        ? { gte: new Date(start) }
        : end
        ? { lte: new Date(end) }
        : undefined;

    // Base role + status filter (mutable array, not readonly)
    const baseWhere: Prisma.usersWhereInput = {
      OR: [
        { userRoles: { some: { roleId: 3 } } },
        { userRoles: { none: {} } },
      ],
      isActive: true,
      isDelete: false,
      ...(createdFilter ? { created_at: createdFilter } : {}),
    };

    // Add search safely under AND so we don't overwrite the role OR filter
    const where: Prisma.usersWhereInput = q
      ? {
          ...baseWhere,
          AND: [
            {
              OR: [
                { name: like(q) },
                { contactNo: like(q) }, // <-- use contactNo, not phone
                { email: like(q) },
              ],
            },
          ],
        }
      : baseWhere;

    const rows = await prisma.users.findMany({
      where,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        name: true,
        contactNo: true, // <-- corrected
        email: true,
        isActive: true,
        created_at: true,
      },
    });

    const header = ["ID", "Name", "Phone", "Email", "Active", "Created At"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          typeof r.id === "bigint" ? r.id.toString() : String(r.id),
          (r.name ?? "").replaceAll(",", " "),
          (r.contactNo ?? "").replaceAll(",", " "), // <-- corrected
          (r.email ?? "").replaceAll(",", " "),
          r.isActive ? "Yes" : "No",
          r.created_at ? new Date(r.created_at).toISOString() : "",
        ].join(",")
      ),
    ].join("\n");

    const filename = `customers_export_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    return new NextResponse(lines, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("customers/export error", err);
    return NextResponse.json(
      { error: "Failed to export customers" },
      { status: 500 }
    );
  }
}
