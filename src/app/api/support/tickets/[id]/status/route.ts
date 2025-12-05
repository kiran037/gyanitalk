// app/api/support/tickets/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getTicketId(context: RouteContext): Promise<bigint> {
  const { params } = context;      // params is a Promise
  const { id } = await params;     // unwrap it

  if (!/^\d+$/.test(id)) {
    throw new Error(`Invalid ticket id: "${id}"`);
  }

  return BigInt(id);
}

// PATCH update ticket status
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const id = await getTicketId(context);
    const body = await req.json();
    const { ticketStatus, modifiedBy } = body;

    // Validation
    if (!ticketStatus) {
      return NextResponse.json(
        { success: false, error: "Ticket status is required" },
        { status: 400 }
      );
    }

    // Allowed statuses
    const allowedStatuses = [
      "Open",
      "In Progress",
      "Awaiting Response",
      "Resolved",
      "Closed",
      "Reopened",
    ];

    if (!allowedStatuses.includes(ticketStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Check if ticket exists
    const existingTicket = await prisma.tickets.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Update status
    const ticket = await prisma.tickets.update({
      where: { id },
      data: {
        ticketStatus,
        modifiedBy: modifiedBy || 1,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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
      user: ticket.user
        ? {
            ...ticket.user,
            id: ticket.user.id.toString(),
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      data: serializedTicket,
      message: `Ticket status updated to ${ticketStatus}`,
    });
  } catch (error: any) {
    console.error("Error updating ticket status:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
