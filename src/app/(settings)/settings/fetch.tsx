"use server"

const prisma = require("@/prismaClient");


export async function getSystemFlags() {
  const groups = await prisma.flaggroup.findMany({
    where: { isDelete: 0 },
    include: {
      systemflags: true,
    },
    orderBy: { displayOrder: "asc" },
  });

  return { groups };
}