"use server"
const prisma = require("../../../prismaClient");
export async function getManual({
  page = 1,
  limit = 15,
  search = "",
  status = "",
  startDate ="",
  endDate ="",

}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;

}) {
  const offset = (page - 1) * limit;

  // ✅ build where condition dynamically
  const where: any = {
    paymentMode: "manual", // 👈 always include
  };

  // 🔍 Search filter
  if (search) {
    const isNumericSearch = /^\d+$/.test(search);
    if (isNumericSearch) {
      where.user = { contactNo: { contains: search } };
    } else {
      where.user = { name: { contains: search } };
    }
  }

  // 📌 Status filter
  if (status) {
    where.paymentStatus = status;
  }

  // 📅 Date filter
  if (startDate && endDate) {
    where.created_at = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  } else if (startDate) {
    where.created_at = {
      gte: new Date(startDate),
    };
  } else if (endDate) {
    where.created_at = {
      lte: new Date(endDate),
    };
  }

  const [payment_manual, totalCount] = await Promise.all([
    prisma.payment.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
      where,
      include: {
        user: {
          select: {
            name: true,
            contactNo: true,
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]); 
  
return {
    payment_manual: payment_manual.map((t: any) => ({
      ...t,
      id: t.id,
      amount: t.amount ? Number(t.amount) : 0, // 👈 Decimal fix
      paymentMode: t.paymentMode,
      paymentReference: t.paymentReference,
      paymentStatus: t.paymentStatus,
      name: t.user?.name || "",
      contactNo: t.user?.contactNo || "",
      created_at: t.created_at ? t.created_at.toISOString() : null,
      updated_at: t.updated_at? t.updated_at.toISOString() : null,
    })),
    totalPages: Math.ceil(totalCount / limit), // ✅ pagination
    currentPage: page,
  };
}

// 1️⃣ Server function (manual transaction approve)
export async function manualtransactionapprove({
  id,
  status,
  transaction_id,
}: {
  id: number;
  status: "success" | "failed";
  transaction_id?: string;
}) {
  try {
    // 1️⃣ Payment find karo
    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) return { success: false, error: "Payment not found" };

    const userId = payment.userId;
    const amount = Number(payment.amount) || 0;
    const cashbackAmount = Number(payment.cashback_amount) || 0;

    // 2️⃣ Payment update
    await prisma.payment.update({
      where: { id },
      data: { paymentStatus: status },
    });

    if (status === "success") {
      // 3️⃣ Cashback transaction
      if (cashbackAmount > 0) {
        await prisma.wallettransaction.create({
          data: {
            userId,
            amount: cashbackAmount,
            isCredit: true,
            transactionType: "Cashback",
          },
        });
      }

      // 4️⃣ Topup transaction
      await prisma.wallettransaction.create({
        data: {
          userId,
          amount,
          isCredit: true,
          transactionType: "Topup",
          transaction_id: transaction_id || null,
        },
      });

      // 5️⃣ UserWallet update / create
      let uw = await prisma.user_wallets.findFirst({where: { userId },});
      if (!uw) {
        uw = await prisma.user_wallets.create({
          data: { userId, createdBy: Number(userId), modifiedBy: Number(userId), amount: 0 },
        });
      }

      await prisma.user_wallets.update({
        where: { id: uw.id },
        data: { amount: (uw.amount || 0) + cashbackAmount + amount, modifiedBy:  Number(userId) },
      });

      // 6️⃣ Referral commission call
      await referCommission(userId, amount);
    }

    return { success: true, message: "Payment updated successfully" };
  } catch (err: any) {
    console.error(err);
    return { success: false, error: err.message || "Failed to update payment" };
  }
}

// Commission Logic
export async function referCommission(
  userId: number,
  amount: number | null = null,
  type: "refer_commission" | "signup_bonus" = "refer_commission"
) {
  // 1️⃣ User fetch
  const user = await prisma.users.findFirst({
    where: { id: userId },
  });

  if (!user) return;

  if (type === "refer_commission") {
    // agar user kisi ne refer kiya hai
    if (user.user_id) {
      // 2️⃣ Referral bonus % systemflag table se lo
      const commission = await prisma.systemflag.findFirst({
        where: { name: "ReferralBonus" },
      });

      if (!commission || !commission.value) return;

      const referredAmount = (amount || 0) * Number(commission.value) / 100;

      // 3️⃣ Transaction insert
      await prisma.wallettransaction.create({
        data: {
          userId: user.user_id, // jisne refer kiya
          referred_user_id: user.id, // jo refer hua
          amount: referredAmount,
          isCredit: true,
          transactionType: "Referred",
        },
      });

      // 4️⃣ UserWallet update ya create
      let uw = await prisma.user_wallets.findFirst({
        where: { userId: user.user_id },
      });

      if (!uw) {
        uw = await prisma.user_wallets.create({
          data: {
            userId: user.user_id,
            createdBy: user.user_id,
            modifiedBy: user.user_id,
            amount: 0,
          },
        });
      }

      await prisma.user_wallets.update({
        where: { userId: user.user_id },
        data: {
          amount: uw.amount + referredAmount,
          modifiedBy: user.user_id,
        },
      });
    }
  } else if (type === "signup_bonus") {
    // 2️⃣ Signup bonus systemflag se lo
    const signupBonus = await prisma.systemflag.findFirst({
      where: { name: "SignupBonus" },
    });

    if (!signupBonus || !signupBonus.value) return;

    const bonusAmount = Number(signupBonus.value);

    // 3️⃣ Transaction insert
    await prisma.wallettransaction.create({
      data: {
        userId,
        amount: bonusAmount,
        isCredit: true,
        transactionType: "Signup Bonus",
      },
    });

    // 4️⃣ Wallet create karo
    await prisma.user_wallets.create({
      data: {
        userId,
        createdBy: userId,
        modifiedBy: userId,
        amount: bonusAmount,
      },
    });
  }
}
