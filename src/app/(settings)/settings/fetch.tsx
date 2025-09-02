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


export async function updateSystemFlag(id: any, data: any) {
  try {
    const flag = await prisma.systemflag.update({
      where: { id },
      data: {
        name: data.name,
        displayName: data.displayName,
        value: data.value,
        valueType: data.valueType,
        description: data.description,
        isActive: data.isActive,
        flagGroupId: data.flagGroupId,
      },
    })

    return { status: true, message: "Flag updated successfully", data: flag }
  } catch (err) {
    console.error("Error updating flag:", err)
    return { status: false, message: "Failed to update flag" }
  }
}
