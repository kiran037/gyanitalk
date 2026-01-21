// ===================================
// FILE: app/api/request/settings/timeout/route.ts
// ===================================

import { NextRequest, NextResponse } from "next/server";
import {
  getRequestExpiryMinutes,
  saveRequestExpiry,
} from "@/lib/assignmentRules";

// ✅ FIX: Add BigInt serialization support
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export async function GET(request: NextRequest) {
  try {
    const expiryMinutes = await getRequestExpiryMinutes();

    return NextResponse.json({
      success: true,
      data: {
        expiryMinutes,
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching timeout settings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch timeout" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { expiryMinutes } = body;

    if (!expiryMinutes || expiryMinutes < 1) {
      return NextResponse.json(
        { success: false, error: "expiryMinutes must be at least 1" },
        { status: 400 }
      );
    }

    await saveRequestExpiry(parseInt(expiryMinutes));

    return NextResponse.json({
      success: true,
      message: "Timeout settings updated successfully",
      data: { expiryMinutes: parseInt(expiryMinutes) },
    });
  } catch (error: any) {
    console.error("❌ Error updating timeout:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update timeout" },
      { status: 500 }
    );
  }
}