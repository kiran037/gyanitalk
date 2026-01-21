import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAssignmentMetadata } from "@/lib/requestAssignment";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const status = searchParams.get("status");
    const astrologerId = searchParams.get("astrologerId");
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const groupId = searchParams.get("groupId"); 

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.callStatus = status;
    }

    if (astrologerId) {
      where.astrologerId = BigInt(astrologerId);
    }

    if (userId) {
      where.userId = BigInt(userId);
    }

    if (startDate && endDate) {
      where.created_at = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [callRequests, totalCount] = await Promise.all([
      prisma.callrequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              contactNo: true,
              email: true,
            },
          },
          astrologer: {
            select: {
              id: true,
              name: true,
              email: true,
              contactNo: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.callrequest.count({ where }),
    ]);

    const enrichedRequests = await Promise.all(
      callRequests.map(async (call) => {
        const metadata = await getAssignmentMetadata(call.id, "call");
        return {
          ...call,
          assignmentMetadata: metadata,
        };
      })
    );

    let finalRequests = enrichedRequests;
    if (groupId) {
      finalRequests = enrichedRequests.filter(
        (req) =>
          req.assignmentMetadata?.assigned_group_id === parseInt(groupId)
      );
    }

    return NextResponse.json({
      success: true,
      data: finalRequests,
      pagination: {
        page,
        limit,
        total: totalCount, 
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error: any) {
    console.error("❌ Error fetching call requests:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch call requests",
      },
      { status: 500 }
    );
  }
}