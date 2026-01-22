// ===================================
// FILE: app/api/request/groups/list/route.ts
// ===================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGroupPriorities } from "@/lib/assignmentRules";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeAstrologers = searchParams.get("includeAstrologers") === "true";

    // 1. Fetch groups
    const groups = await prisma.astrologer_groups.findMany({
      orderBy: { name: "asc" },
    });

    console.log("🔍 DEBUG: Groups found:", groups.length);

    const priorities = await getGroupPriorities();

    // 2. For each group, manually fetch assignments
    const enrichedGroups = await Promise.all(
      groups.map(async (group) => {
        const groupIdStr = group.id.toString();
        const priority = priorities[groupIdStr];

        // ✅ Manually query assignments for this group
        const assignments = await prisma.astrologer_assign_group.findMany({
          where: {
            group_id: group.id,
            astrologerId: { not: null },
          },
          include: includeAstrologers
            ? {
                astrologer: {
                  select: {
                    id: true,
                    name: true,
                    profileImage: true,
                    chatStatus: true,
                    callStatus: true,
                    experienceInYears: true,
                    primarySkill: true,
                    isActive: true,
                    isDelete: true,
                  },
                },
              }
            : undefined,
        });

        console.log(`🔍 Group "${group.name}" has ${assignments.length} assignments`);

        // Filter active astrologers
        const validAssignments = assignments.filter((a: any) => {
          if (!includeAstrologers) return true;
          return a.astrologer && a.astrologer.isActive && !a.astrologer.isDelete;
        });

        const totalAstrologers = validAssignments.length;

        const activeAstrologers = includeAstrologers
          ? validAssignments.filter(
              (a: any) =>
                a.astrologer &&
                (a.astrologer.chatStatus !== "Offline" ||
                 a.astrologer.callStatus !== "Offline")
            ).length
          : 0;

        return {
          id: group.id,
          name: group.name,
          created_at: group.created_at,
          totalAstrologers,
          activeAstrologers,
          priority: priority?.priority || null,
          timeout: priority?.timeout || null,
          astrologers: includeAstrologers
            ? validAssignments.map((a: any) => a.astrologer).filter(Boolean)
            : undefined,
        };
      })
    );

    enrichedGroups.sort((a, b) => {
      const pA = a.priority ?? Number.MAX_SAFE_INTEGER;
      const pB = b.priority ?? Number.MAX_SAFE_INTEGER;
      return pA - pB;
    });

    return NextResponse.json({
      success: true,
      data: enrichedGroups,
      total: enrichedGroups.length,
    });
  } catch (error: any) {
    console.error("❌ Error fetching groups:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch groups" },
      { status: 500 }
    );
  }
}