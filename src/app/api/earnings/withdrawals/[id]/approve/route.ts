// // app/api/earnings/withdrawals/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Next 15: params is a Promise
type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getWithdrawalId(context: RouteContext): Promise<number> {
  const { id } = await context.params; // unwrap params Promise
  const num = Number(id);

  if (!Number.isInteger(num)) {
    throw new Error(`Invalid withdrawal id: "${id}"`);
  }

  return num;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const body = await request.json();
    const { modifiedBy, notes } = body;

    const modifiedByInt =
      typeof modifiedBy === "string" ? parseInt(modifiedBy, 10) : modifiedBy;

    if (!modifiedByInt || !Number.isInteger(modifiedByInt)) {
      return NextResponse.json(
        {
          success: false,
          error: "modifiedBy is required and must be a valid number",
        },
        { status: 400 }
      );
    }

    const id = await getWithdrawalId(context);

    // Get withdrawal request
    const withdrawal = await prisma.withdrawrequest.findUnique({
      where: { id },
      include: { astrologer: true },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { success: false, error: "Withdrawal request not found" },
        { status: 404 }
      );
    }

if (withdrawal.status !== "Pending") {
  return NextResponse.json(
    {
      success: false,
      error: `Cannot approve withdrawal with status: ${withdrawal.status}`,
    },
    { status: 400 }
  );
}


    // Check astrologer balance
    const transactions = await prisma.wallettransaction.findMany({
      where: { astrologerId: withdrawal.astrologerId || undefined },
    });

    const balance = transactions.reduce((acc, t) => {
      return acc + (t.isCredit ? t.amount || 0 : -(t.amount || 0));
    }, 0);

    const withdrawAmount = parseFloat(
      withdrawal.withdrawAmount?.toString() || "0"
    );

    if (balance < withdrawAmount) {
      return NextResponse.json(
        { success: false, error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Update withdrawal status to approved
    const updatedWithdrawal = await prisma.withdrawrequest.update({
      where: { id },
     data: {
  status: "Released", // ✅ enum value
  modifiedBy: modifiedByInt,
},

    });

    // Create debit transaction in wallet
    await prisma.wallettransaction.create({
      data: {
        amount: withdrawAmount,
        userId: withdrawal.astrologer?.userId ?? null,
        astrologerId: withdrawal.astrologerId || undefined,
        transactionType: "withdrawal",
        isCredit: false,
        createdBy: modifiedByInt,
        modifiedBy: modifiedByInt,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Withdrawal approved successfully",
      data: {
        // JSON-safe serialization
        id: updatedWithdrawal.id, // Int is safe
        astrologerId: updatedWithdrawal.astrologerId
          ? updatedWithdrawal.astrologerId.toString()
          : null,
        withdrawAmount: updatedWithdrawal.withdrawAmount
          ? updatedWithdrawal.withdrawAmount.toString()
          : null,
        status: updatedWithdrawal.status,
        isActive: updatedWithdrawal.isActive,
        isDelete: updatedWithdrawal.isDelete,
        created_at: updatedWithdrawal.created_at,
        updated_at: updatedWithdrawal.updated_at,
        createdBy: updatedWithdrawal.createdBy,
        modifiedBy: updatedWithdrawal.modifiedBy,
        paymentMethod: updatedWithdrawal.paymentMethod,
        upiId: updatedWithdrawal.upiId,
        accountNumber: updatedWithdrawal.accountNumber,
        ifscCode: updatedWithdrawal.ifscCode,
        accountHolderName: updatedWithdrawal.accountHolderName,
        notes: notes ?? null,
      },
    });
  } catch (error) {
    console.error("Approve withdrawal error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to approve withdrawal" },
      { status: 500 }
    );
  }
}
