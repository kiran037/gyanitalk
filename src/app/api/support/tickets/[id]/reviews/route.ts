// app/api/support/tickets/[id]/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all reviews for a ticket
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = BigInt(params.id);

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

    // Serialize
    const serializedReviews = reviews.map(review => ({
      ...review,
      ticketId: review.ticketId.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: serializedReviews,
      count: reviews.length,
      averageRating: reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length 
        : 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create new review for ticket
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = BigInt(params.id);
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

    // Check if user already reviewed this ticket
    const existingReview = await prisma.ticketreview.findFirst({
      where: {
        ticketId,
        userId: parseInt(userId),
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
        userId: parseInt(userId),
        rating: rating || null,
        review: review || null,
      },
    });

    // Serialize
    const serializedReview = {
      ...newReview,
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
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}