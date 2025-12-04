// // app/api/support/tickets/[id]/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// Helper: safely get BigInt ticketId from context
async function getTicketId(context: RouteContext): Promise<bigint> {
  const { params } = context;      // params is a Promise
  const { id } = await params;     // unwrap it

  if (!/^\d+$/.test(id)) {
    throw new Error(`Invalid ticket id: "${id}"`);
  }

  return BigInt(id);
}

// GET all reviews for a ticket
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const ticketId = await getTicketId(context);

    // Check if ticket exists
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Get all reviews
    const reviews = await prisma.ticketreview.findMany({
      where: { ticketId },
      orderBy: { created_at: "desc" },
    });

    // Serialize BigInt fields if needed
    const serializedReviews = reviews.map((review) => ({
      ...review,
      id: review.id.toString?.() ?? review.id,           // if id is bigint
      userId: review.userId?.toString?.() ?? review.userId,
      ticketId: review.ticketId.toString(),
    }));

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        : 0;

    return NextResponse.json({
      success: true,
      data: serializedReviews,
      count: reviews.length,
      averageRating,
    });
  } catch (error: any) {
    console.error("Error fetching ticket reviews:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create new review for ticket
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const ticketId = await getTicketId(context);
    const body = await req.json();
    const { userId, rating, review } = body;

    // Validation
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if ticket exists
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    // If your ticketreview.userId column is BIGINT, switch this to BigInt(userId)
    const userIdNum = parseInt(userId);
    if (Number.isNaN(userIdNum)) {
      return NextResponse.json(
        { success: false, error: "Invalid userId" },
        { status: 400 }
      );
    }

    // Check if user already reviewed this ticket
    const existingReview = await prisma.ticketreview.findFirst({
      where: {
        ticketId,
        userId: userIdNum,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: "User has already reviewed this ticket" },
        { status: 400 }
      );
    }

    // Create review
    const newReview = await prisma.ticketreview.create({
      data: {
        ticketId,
        userId: userIdNum,
        rating: rating || null,
        review: review || null,
      },
    });

    // Serialize
    const serializedReview = {
      ...newReview,
      id: newReview.id.toString?.() ?? newReview.id,
      userId: newReview.userId?.toString?.() ?? newReview.userId,
      ticketId: newReview.ticketId.toString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: serializedReview,
        message: "Review submitted successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating ticket review:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
