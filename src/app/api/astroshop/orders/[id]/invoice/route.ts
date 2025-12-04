import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Generate invoice HTML/PDF data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: idStr } = (await params) as { id: string };
    if (!/^\d+$/.test(idStr)) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }
    const id = BigInt(idStr);

    const order = await prisma.order_request.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            contactNo: true,
            countryCode: true,
          },
        },
        product: {
          select: {
            name: true,
            description: true,
            // Don't select amount - use order's payableAmount
          },
        },
        product_category: {
          select: {
            name: true,
          },
        },
        order_address: true,
        coupon_user_usages: {
          include: {
            coupons: {
              select: {
                code: true,
                discount_type: true,
                discount_value: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Only generate invoices for product orders
    if (!order.productId) {
      return NextResponse.json(
        { success: false, error: 'Invoice only available for product orders' },
        { status: 400 }
      );
    }

    // Calculate amounts - convert Decimals properly
    const subtotal = order.payableAmount 
      ? Number(order.payableAmount.toString()) 
      : 0;
    const gstPercent = order.gstPercent 
      ? Number(order.gstPercent.toString()) 
      : 0;
    const gstAmount = (subtotal * gstPercent) / 100;
    const walletDeduction = order.walletBalanceDeducted 
      ? Number(order.walletBalanceDeducted.toString()) 
      : 0;
    const couponDiscount = order.coupon_user_usages[0]?.amt 
      ? Number(order.coupon_user_usages[0].amt) 
      : 0;
    const total = order.totalPayable 
      ? Number(order.totalPayable.toString()) 
      : 0;

    // Generate invoice HTML
    const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        .invoice-container { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 30px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #333; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .section { margin-bottom: 20px; }
        .section-title { font-weight: bold; margin-bottom: 10px; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f5f5f5; font-weight: bold; }
        .totals { text-align: right; }
        .totals table { width: 300px; margin-left: auto; }
        .grand-total { font-size: 18px; font-weight: bold; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <h1>INVOICE</h1>
          <p>Order #${order.id.toString()}</p>
          <p>Date: ${order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</p>
        </div>

        <div class="invoice-details">
          <div class="section">
            <div class="section-title">Bill To:</div>
            <p>${order.user?.name || 'N/A'}<br>
            ${order.user?.email || ''}<br>
            ${order.user?.countryCode || ''} ${order.user?.contactNo || ''}</p>
            ${order.order_address ? `
            <p>${order.order_address.flatNo}, ${order.order_address.locality}<br>
            ${order.order_address.city}, ${order.order_address.state}<br>
            ${order.order_address.pincode}, ${order.order_address.country}</p>
            ` : ''}
          </div>

          <div class="section">
            <div class="section-title">Order Details:</div>
            <p><strong>Order Type:</strong> ${order.orderType || 'N/A'}<br>
            <strong>Payment Method:</strong> ${order.paymentMethod || 'N/A'}<br>
            <strong>Status:</strong> ${order.orderStatus || 'N/A'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product/Service</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${order.product?.name || order.orderType || 'Service'}</td>
              <td>${order.product_category?.name || 'N/A'}</td>
              <td>₹${subtotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr>
              <td>Subtotal:</td>
              <td>₹${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>GST (${gstPercent}%):</td>
              <td>₹${gstAmount.toFixed(2)}</td>
            </tr>
            ${order.coupon_user_usages[0] ? `
            <tr>
              <td>Coupon (${order.coupon_user_usages[0].coupons.code}):</td>
              <td>-₹${couponDiscount.toFixed(2)}</td>
            </tr>
            ` : ''}
            ${walletDeduction > 0 ? `
            <tr>
              <td>Wallet Deduction:</td>
              <td>-₹${walletDeduction.toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr class="grand-total">
              <td>Total:</td>
              <td>₹${total.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>This is a computer-generated invoice and does not require a signature.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id.toString(),
        invoiceHTML,
        orderDetails: {
          subtotal,
          gstAmount,
          walletDeduction,
          couponDiscount,
          total,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}