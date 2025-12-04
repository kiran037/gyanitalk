// app/api/support/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all contacts with filters and search
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const sortBy = searchParams.get("sortBy") || "created_at";
        const sortOrder = searchParams.get("sortOrder") || "desc";
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        // Search by name or email
        if (search) {
            where.OR = [
                { contact_name: { contains: search } },
                { contact_email: { contains: search } },
                { contact_message: { contains: search } },
            ];
        }

        // Date range filter
        if (startDate || endDate) {
            where.created_at = {};
            if (startDate) where.created_at.gte = new Date(startDate);
            if (endDate) where.created_at.lte = new Date(endDate);
        }

        // Get total count
        const total = await prisma.contact_us.count({ where });

        // Get contacts
        const contacts = await prisma.contact_us.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
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
        const { contact_name, contact_email, contact_message } = body;

        // Validation
        if (!contact_name || !contact_email || !contact_message) {
            return NextResponse.json(
                { success: false, error: "All fields are required" },
                { status: 400 }
            );
        }

        // Email validation
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