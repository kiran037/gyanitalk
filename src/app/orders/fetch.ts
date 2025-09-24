"use server"
const prisma = require("../../prismaClient");
import { serializeOrder } from "@/lib/utils";

export async function getOrders({
  page = 1,
  limit = 15,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {

  const isNumericSearch = /^\d+$/.test(search);
  const isAlphaSearch = /[a-zA-Z]/.test(search);


  const offset = (page - 1) * limit;
  const baseWhere = {
    ...(search &&
      isAlphaSearch && {
      name: { contains: search },
    }),
    ...(search &&
      isNumericSearch && {
      contactNo: { contains: search },
    }),
  };

  const [ordersRaw, totalCount] = await Promise.all([
    prisma.order_request.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
      where: {
        orderType: "astromall",
        user: {
          name: search ? { contains: search } : undefined,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            profile: true,
            contactNo: true,
            email: true,
          },
        },
        product: {
          select: {
            name: true,
            productImage: true,
            product_category: {
                select: {
                  name: true,
                },
            },
          },
        },
        order_address: {
          select: {
            name: true,
            phoneNumber: true,
            phoneNumber2: true,
            flatNo: true,
            locality: true,
            landmark: true,
            city: true,
            state: true,
            country: true,
            pincode: true,
          },
        },  
      },
    }),

    prisma.order_request.count({
      where: {
        orderType: "astromall",
        user: {
          name: search ? { contains: search } : undefined,
        },
      },
    }),

  ]);

  // ✅ Add created_at + GST together
  const orders = ordersRaw.map((order: any) => {
    const serialized = serializeOrder(order);

    // ✅ Calculate GST amount
    let gstAmount = 0;
    if (serialized.gstPercent && serialized.gstPercent > 0) {
      gstAmount = Number(serialized.payableAmount) * (serialized.gstPercent / 100);
      gstAmount = Number(gstAmount.toFixed(2));
    }

  return {
      ...serialized,
      gstAmount,
      // ✅ Ensure created_at is serialized as ISO string
      created_at: order.created_at ? order.created_at.toISOString() : null,
    };
  });

  return {
    orders,
    total: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

export async function downloadInvoice(id: number) {
  const order_invoice = await prisma.order_request.findUnique({
    where: { id: Number(id) },
    include: {
      user: {
        select: {
          name: true,
          contactNo: true,
          email: true,
        },
      },
      product: {
        select: {
          name: true,
          productImage: true,
          product_category: {
            select: { name: true },
          },
        },
      },
      order_address: {
        select: {
          name: true,
          phoneNumber: true,
          flatNo: true,
          locality: true,
          landmark: true,
          city: true,
          state: true,
          country: true,
          pincode: true,
        },
      },
    },
  }); 

  if (!order_invoice) return null;

  // ✅ Serialize BigInt fields to number
  const serialized = JSON.parse(
    JSON.stringify(order_invoice, (_, value) =>
      typeof value === "bigint" ? Number(value) : value
    )
  );

  // ✅ Calculate GST
  let gstAmount = 0;
  if (serialized.gstPercent && serialized.gstPercent > 0) {
    gstAmount = Number(serialized.payableAmount) * (serialized.gstPercent / 100);
    gstAmount = Number(gstAmount.toFixed(2));
  }
  serialized.gstAmount = gstAmount;

  return serialized;
}

export async function changeOrderStatus(id: number, status: string) {
  try {
    const updatedOrder = await prisma.order_request.update({
      where: { id: Number(id) },
      data: {
        orderStatus: status,
        updated_at: new Date(),
      },
    });

    return { success: true, order: serializeOrder(updatedOrder) };
  } catch (error: any) {
    console.error("Error changing order status:", error);
    return { success: false, message: "Failed to update status" };
  }
}
