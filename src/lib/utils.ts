import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility to serialize Prisma Decimal
export function serializeOrder(order: any) {
  return {
    ...order,
    payableAmount: order.payableAmount ? Number(order.payableAmount) : null,
    walletBalanceDeducted: order.walletBalanceDeducted
      ? Number(order.walletBalanceDeducted)
      : null,
    gstPercent: order.gstPercent ? Number(order.gstPercent) : null,
    totalPayable: order.totalPayable ? Number(order.totalPayable) : null,
    gstAmount: order.gstAmount ? Number(order.gstAmount) : 0,
    created_at: order.created_at ? order.created_at.toISOString() : null,
    updated_at: order.updated_at ? order.updated_at.toISOString() : null,
  };
}
