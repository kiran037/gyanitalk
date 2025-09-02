"use server"

const prisma = require("@/prismaClient");


export async function gethororscope() {
  const hororscope = await prisma.hororscope_signs.findMany();
  return { hororscope };
}


export async function updatehororscope(id: any, path: any) {
  try {
    const flag = await prisma.hororscope_signs.update({
      where: { id },
      data: {
        image: path,
      },
    })

    return { status: true, message: "hororscope updated successfully", data: flag }
  } catch (err) {
    console.error("Error updating flag:", err)
    return { status: false, message: "Failed to update hororscope" }
  }
}
