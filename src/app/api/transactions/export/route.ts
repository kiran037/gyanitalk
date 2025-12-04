// app/api/transactions/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type, // "wallet", "payment", or "manual"
      filters = {},
      format = "csv", // "csv" or "json"
    } = body;

    if (!type || !["wallet", "payment", "manual"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid export type. Must be 'wallet', 'payment', or 'manual'",
        },
        { status: 400 }
      );
    }

    let data: any[] = [];

    // Build where clause from filters
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.created_at = {};
      if (filters.startDate) {
        where.created_at.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.created_at.lte = new Date(filters.endDate);
      }
    }

    // Fetch data based on type
    if (type === "wallet") {
      if (filters.transactionType) where.transactionType = filters.transactionType;
      if (filters.isCredit !== undefined) where.isCredit = filters.isCredit;

      const transactions = await prisma.wallettransaction.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              contactNo: true,
            },
          },
          astrologer: {
            select: {
              name: true,
            },
          },
          ai_astrologer: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      });

      data = transactions.map((t) => ({
        ID: t.id,
        User: t.user?.name || "N/A",
        Email: t.user?.email || "N/A",
        Phone: t.user?.contactNo || "N/A",
        Amount: t.amount,
        Type: t.isCredit ? "Credit" : "Debit",
        TransactionType: t.transactionType,
        TransactionID: t.transaction_id,
        Astrologer: t.astrologer?.name || t.ai_astrologer?.name || "N/A",
        OrderID: t.orderId || "N/A",
        Date: t.created_at?.toISOString(),
      }));
    } else if (type === "payment") {
      if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
      if (filters.paymentMode) where.paymentMode = filters.paymentMode;

      const payments = await prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              contactNo: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      });

      data = payments.map((p) => ({
        ID: p.id,
        User: p.user?.name || "N/A",
        Email: p.user?.email || "N/A",
        Phone: p.user?.contactNo || "N/A",
        Amount: p.amount,
        Cashback: p.cashback_amount || 0,
        PaymentMode: p.paymentMode,
        PaymentReference: p.paymentReference,
        OrderID: p.orderId,
        Status: p.paymentStatus,
        Type: p.type,
        Date: p.created_at?.toISOString(),
      }));
    } else if (type === "manual") {
      where.paymentMode = "manual";
      if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;

      const manualPayments = await prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              contactNo: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      });

      data = manualPayments.map((p) => ({
        ID: p.id,
        User: p.user?.name || "N/A",
        Email: p.user?.email || "N/A",
        Phone: p.user?.contactNo || "N/A",
        Amount: p.amount,
        PaymentReference: p.paymentReference,
        Status: p.paymentStatus,
        Attachment: p.attachment || "N/A",
        Date: p.created_at?.toISOString(),
      }));
    }

    // Format response based on format type
    if (format === "csv") {
      if (data.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "No data found to export",
          },
          { status: 404 }
        );
      }

      // Generate CSV
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(","), // Header row
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header];
              // Escape commas and quotes
              return typeof value === "string" && (value.includes(",") || value.includes('"'))
                ? `"${value.replace(/"/g, '""')}"`
                : value;
            })
            .join(",")
        ),
      ];

      const csvContent = csvRows.join("\n");

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${type}_transactions_${Date.now()}.csv"`,
        },
      });
    } else {
      // Return JSON
      return NextResponse.json({
        success: true,
        data,
        count: data.length,
        exportedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error exporting transactions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to export transactions",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}