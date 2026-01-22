// ===================================
// FILE: app/api/request/settings/priorities/route.ts
// ===================================

import { NextRequest, NextResponse } from "next/server";
import {
  getGroupPriorities,
  saveGroupPriorities,
  validateGroupPriorities,
} from "@/lib/assignmentRules";

// ✅ FIX: Add BigInt serialization support
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export async function GET(request: NextRequest) {
  try {
    const priorities = await getGroupPriorities();

    return NextResponse.json({
      success: true,
      data: priorities,
    });
  } catch (error: any) {
    console.error("❌ Error fetching priorities:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch priorities" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate
    const validation = validateGroupPriorities(body);
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
    const updatedPriorities = await saveGroupPriorities(body);

    return NextResponse.json({
      success: true,
      message: "Group priorities updated successfully",
      data: updatedPriorities,
    });
  } catch (error: any) {
    console.error("❌ Error saving priorities:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save priorities" },
      { status: 500 }
    );
  }
}