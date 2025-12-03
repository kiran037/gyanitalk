import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Export orders to CSV
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderStatus = searchParams.get('orderStatus');
    const orderType = searchParams.get('orderType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {
      isDelete: '0',
      productId: { not: null }, // Only product/mall orders
    };

    if (orderStatus) {
      where.orderStatus = orderStatus;
    }

    if (orderType) {
      where.orderType = orderType;
    }

    if (startDate && endDate) {
      where.created_at = {
        gte: new Date(startDate + 'T00:00:00'),
        lte: new Date(endDate + 'T23:59:59'),
      };
    }

    const orders = await prisma.order_request.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            contactNo: true,
          },
        },
        product: {
          select: {
            name: true,
          },
        },
        product_category: {
          select: {
            name: true,
          },
        },
        order_address: {
          select: {
            city: true,
            state: true,
            pincode: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Generate CSV
    const csvHeaders = [
      'Order ID',
      'Order Date',
      'Customer Name',
      'Email',
      'Contact',
      'Product/Service',
      'Category',
      'Order Type',
      'Amount',
      'GST %',
      'Total',
      'Payment Method',
      'Status',
      'City',
      'State',
    ];

    const csvRows = orders.map((order) => {
      // Safely convert Decimals to numbers
      const payableAmount = order.payableAmount 
        ? Number(order.payableAmount.toString()) 
        : 0;
      const gstPercent = order.gstPercent 
        ? Number(order.gstPercent.toString()) 
        : 0;
      const totalPayable = order.totalPayable 
        ? Number(order.totalPayable.toString()) 
        : 0;

      return [
        order.id.toString(),
        order.created_at ? new Date(order.created_at).toLocaleDateString() : '',
        order.user?.name || '',
        order.user?.email || '',
        order.user?.contactNo || '',
        order.product?.name || order.orderType || '',
        order.product_category?.name || '',
        order.orderType || '',
        payableAmount.toFixed(2),
        gstPercent.toFixed(2),
        totalPayable.toFixed(2),
        order.paymentMethod || '',
        order.orderStatus || '',
        order.order_address?.city || '',
        order.order_address?.state || '',
      ];
    });

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) =>
        row.map((cell) => `"${cell}"`).join(',')
      ),
    ].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="orders_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}