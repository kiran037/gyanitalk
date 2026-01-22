// ===================================
// FILE: app/api/request/settings/rules/route.ts
// ===================================

import { NextRequest, NextResponse } from "next/server";
import {
  getAssignmentRules,
  saveAssignmentRules,
  validateAssignmentRules,
} from "@/lib/assignmentRules";

// ✅ FIX: Add BigInt serialization support
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export async function GET(request: NextRequest) {
  try {
    const rules = await getAssignmentRules();

    return NextResponse.json({
      success: true,
      data: rules,
    });
  } catch (error: any) {
    console.error("❌ Error fetching assignment rules:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch rules" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate
    const validation = validateAssignmentRules(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Save
    const updatedRules = await saveAssignmentRules(body);

    return NextResponse.json({
      success: true,
      message: "Assignment rules updated successfully",
      data: updatedRules,
    });
  } catch (error: any) {
    console.error("❌ Error saving assignment rules:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save rules" },
      { status: 500 }
    );
  }
}