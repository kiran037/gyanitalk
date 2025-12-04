import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const rechargeId = Number(id);

  try {
    const recharge = await prisma.rechargeamount.findUnique({
      where: { id: rechargeId },
    });

    if (!recharge) {
      return NextResponse.json(
        { success: false, error: "Recharge amount not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: recharge });
  } catch (error) {
    console.error("Error fetching recharge amount:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recharge amount" },
      { status: 500 }
    );
  }
}

// PUT
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const rechargeId = Number(id);

  try {
    const body = await req.json();
    const { amount, cashback } = body;

    const existing = await prisma.rechargeamount.findUnique({
      where: { id: rechargeId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Recharge amount not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.rechargeamount.update({
      where: { id: rechargeId },
      data: {
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(cashback !== undefined && { cashback: Number(cashback) }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Recharge amount updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating recharge amount:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update recharge amount" },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const rechargeId = Number(id);

  try {
    const existing = await prisma.rechargeamount.findUnique({
      where: { id: rechargeId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Recharge amount not found" },
        { status: 404 }
      );
    }

    await prisma.rechargeamount.delete({
      where: { id: rechargeId },
    });

    return NextResponse.json({
      success: true,
      message: "Recharge amount deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting recharge amount:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete recharge amount" },
      { status: 500 }
    );
  }
}
