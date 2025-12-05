// app/api/support/contact/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { contact_name: { contains: search } },
        { contact_email: { contains: search } },
        { contact_message: { contains: search } },
      ];
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = new Date(startDate);
      if (endDate) where.created_at.lte = new Date(endDate);
    }

    const contacts = await prisma.contact_us.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    const csvHeaders = ["ID", "Name", "Email", "Message", "Created At", "Updated At"];

    const csvRows = contacts.map((contact) => [
      contact.id,
      `"${(contact.contact_name ?? "").replace(/"/g, '""')}"`,
      contact.contact_email ?? "",
      `"${(contact.contact_message ?? "").replace(/"/g, '""')}"`,
      contact.created_at?.toISOString() ?? "",
      contact.updated_at?.toISOString() ?? "",
    ]);

    const csv = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="contacts_${new Date().toISOString()}.csv"`,
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
