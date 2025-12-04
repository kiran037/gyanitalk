// app/api/support/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const allowedSortFields = ["created_at", "updated_at", "contact_name", "contact_email"] as const;

// GET all contacts with filters and search
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    let page = parseInt(searchParams.get("page") || "1", 10);
    let limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const sortByParam = searchParams.get("sortBy") || "created_at";
    const sortOrderParam = searchParams.get("sortOrder") || "desc";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!Number.isInteger(page) || page < 1) page = 1;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) limit = 10;

    const sortBy = allowedSortFields.includes(sortByParam as any)
      ? (sortByParam as (typeof allowedSortFields)[number])
      : "created_at";

    const sortOrder = sortOrderParam === "asc" ? "asc" : "desc";

    const skip = (page - 1) * limit;

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

    const total = await prisma.contact_us.count({ where });

    const contacts = await prisma.contact_us.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder as "asc" | "desc" },
    });

    return NextResponse.json({
      success: true,
      data: contacts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create new contact
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const contact_name = body.contact_name?.trim();
    const contact_email = body.contact_email?.trim();
    const contact_message = body.contact_message?.trim();

    if (!contact_name || !contact_email || !contact_message) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact_email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    const contact = await prisma.contact_us.create({
      data: {
        contact_name,
        contact_email,
        contact_message,
      },
    });

    return NextResponse.json(
      { success: true, data: contact, message: "Contact created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
