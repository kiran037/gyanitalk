"use server"

const prisma = require("@/prismaClient")

export async function getrechargeamount() {
  const rechargeamount = await prisma.rechargeamount.findMany({
    orderBy: { created_at: "desc" },
  })
  return { rechargeamount }
}

export async function createrechargeamount(data: { amount: number; cashback?: number }) {
  try {
    const newEntry = await prisma.rechargeamount.create({
      data: {
        amount: data.amount,
        cashback: data.cashback ?? null,
      },
    })
    return { status: true, message: "Recharge amount created", data: newEntry }
  } catch (err) {
    console.error("Error creating recharge amount:", err)
    return { status: false, message: "Failed to create recharge amount" }
  }
}

export async function updaterechargeamount(id: number, data: { amount?: number; cashback?: number }) {
  try {
    const flag = await prisma.rechargeamount.update({
      where: { id },
      data,
    })
    return { status: true, message: "Recharge amount updated", data: flag }
  } catch (err) {
    console.error("Error updating recharge amount:", err)
    return { status: false, message: "Failed to update recharge amount" }
  }
}
