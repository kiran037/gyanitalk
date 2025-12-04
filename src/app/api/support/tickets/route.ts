// app/api/support/tickets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all tickets with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status"); // Filter by ticketStatus
    const userId = searchParams.get("userId");
    const helpSupportId = searchParams.get("helpSupportId");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isDelete: false, // Only show non-deleted tickets
    };

    // Search by ticket number or subject
    if (search) {
      where.OR = [
        { ticketNumber: { contains: search } },
        { subject: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Filter by status
    if (status) {
      where.ticketStatus = status;
    }

    if (userId) {
      if (!/^\d+$/.test(userId)) {
        return NextResponse.json(
          { success: false, error: "Invalid userId" },
          { status: 400 }
        );
      }
      where.userId = BigInt(userId);
    }

    if (helpSupportId) {
      if (!/^\d+$/.test(helpSupportId)) {
        return NextResponse.json(
          { success: false, error: "Invalid helpSupportId" },
          { status: 400 }
        );
      }
      where.helpSupportId = BigInt(helpSupportId);
    }


    // Date range filter
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = new Date(startDate);
      if (endDate) where.created_at.lte = new Date(endDate);
    }

    // Get total count
    const total = await prisma.tickets.count({ where });

    // Get tickets with relations
    const tickets = await prisma.tickets.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            contactNo: true,
          },
        },
        help_support: {
          select: {
            id: true,
            name: true,
          },
        },
        ticketreview: {
          select: {
            id: true,
            rating: true,
            review: true,
            created_at: true,
          },
        },
      },
    });

    const serializedTickets = tickets.map((ticket) => ({
      ...ticket,
      id: ticket.id.toString(),
      userId: ticket.userId.toString(),
      helpSupportId: ticket.helpSupportId.toString(),
      user: ticket.user
        ? {
          ...ticket.user,
          id: ticket.user.id.toString(),
        }
        : null,
      help_support: ticket.help_support
        ? {
          ...ticket.help_support,
          id: ticket.help_support.id.toString(),
        }
        : null,
      ticketreview: ticket.ticketreview.map((r) => ({
        ...r,
        id: (r as any).id?.toString?.() ?? r.id, // in case it's bigint
        // if you ever include userId/ticketId here, also toString() them
      })),
    }));


    return NextResponse.json({
      success: true,
      data: serializedTickets,
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

// POST create new ticket
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      helpSupportId,
      subject,
      description,
      createdBy,
    } = body;

    // Validation
    if (!userId || !helpSupportId || !subject || !description) {
      return NextResponse.json(
        { success: false, error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Generate ticket number
    const ticketNumber = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const ticket = await prisma.tickets.create({
      data: {
        userId: BigInt(userId),
        helpSupportId: BigInt(helpSupportId),
        subject,
        description,
        ticketNumber,
        ticketStatus: "Open", // Default status
        isActive: true,
        isDelete: false,
        createdBy: createdBy || 1,
        modifiedBy: createdBy || 1,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        help_support: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Serialize BigInt
    const serializedTicket = {
      ...ticket,
      id: ticket.id.toString(),
      userId: ticket.userId.toString(),
      helpSupportId: ticket.helpSupportId.toString(),
      user: ticket.user ? {
        ...ticket.user,
        id: ticket.user.id.toString(),
      } : null,
      help_support: ticket.help_support ? {
        ...ticket.help_support,
        id: ticket.help_support.id.toString(),
      } : null,
    };

    return NextResponse.json(
      { success: true, data: serializedTicket, message: "Ticket created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}