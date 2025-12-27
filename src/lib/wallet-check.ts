///Users/xeoren/Desktop/gyanitallk-admin/src/lib/wallet-check.ts
import { prisma } from "@/lib/prisma";

export class WalletChecker {
  static async checkBalance(userId: number, amount: number): Promise<{
    hasBalance: boolean;
    currentBalance: number;
    walletId: bigint | null;
  }> {
    const wallet = await prisma.user_wallets.findFirst({
      where: { userId: BigInt(userId) }
    });

    if (!wallet) {
      return { hasBalance: false, currentBalance: 0, walletId: null };
    }

    const balance = Number(wallet.amount || 0);
    return {
      hasBalance: balance >= amount,
      currentBalance: balance,
      walletId: wallet.id
    };
  }

  static async deductAmount(
    userId: number,
    amount: number,
    transactionType: string,
    description?: string
  ): Promise<boolean> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Atomic debit operation
        const result = await tx.user_wallets.updateMany({
          where: {
            userId: BigInt(userId),
            amount: { gte: amount }
          },
          data: {
            amount: { decrement: amount }
          }
        });

        if (result.count === 0) {
          throw new Error('Insufficient balance');
        }

        // Create transaction record
        await tx.wallettransaction.create({
          data: {
            userId: BigInt(userId),
            amount: amount,
            isCredit: false,
            transactionType,
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        return true;
      });
    } catch (error) {
      console.error('Wallet deduction failed:', error);
      return false;
    }
  }
}