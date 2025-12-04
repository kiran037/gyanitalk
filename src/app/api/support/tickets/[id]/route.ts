// // app/api/support/tickets/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// Helper to safely get BigInt ID from params
async function getTicketId(context: RouteContext): Promise<bigint> {
  const { params } = context;      // params is a Promise
  const { id } = await params;     // unwrap it

  if (!/^\d+$/.test(id)) {
    throw new Error(`Invalid ticket id: "${id}"`);
  }

  return BigInt(id);
}

// GET single ticket by ID
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const id = await getTicketId(context);

    const ticket = await prisma.tickets.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            contactNo: true,
            profile: true,
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
            userId: true,
            ticketId: true,
            created_at: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Serialize BigInt-related fields
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
      help_support: ticket.help_support
        ? {
            ...ticket.help_support,
            id: ticket.help_support.id.toString(),
          }
        : null,
      ticketreview: ticket.ticketreview.map((review) => ({
        ...review,
        id: review.id.toString(),
        userId: review.userId.toString(),
        ticketId: review.ticketId.toString(),
      })),
    };

    return NextResponse.json({ success: true, data: serializedTicket });
  } catch (error: any) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH update ticket
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const id = await getTicketId(context);
    const body = await req.json();

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

    // Prepare update data
    const updateData: any = {
      modifiedBy: body.modifiedBy || 1,
    };

    if (body.subject) updateData.subject = body.subject;
    if (body.description) updateData.description = body.description;
    if (body.ticketStatus) updateData.ticketStatus = body.ticketStatus;
    if (body.chatId !== undefined) updateData.chatId = body.chatId;
    if (body.helpSupportId) updateData.helpSupportId = BigInt(body.helpSupportId);
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    // Update ticket
    const ticket = await prisma.tickets.update({
      where: { id },
      data: updateData,
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
    };

    return NextResponse.json({
      success: true,
      data: serializedTicket,
      message: "Ticket updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating ticket:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE ticket (soft delete)
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const id = await getTicketId(context);

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

    // Soft delete
    await prisma.tickets.update({
      where: { id },
      data: {
        isDelete: true,
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting ticket:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
