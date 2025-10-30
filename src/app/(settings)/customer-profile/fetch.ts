"use server"

const prisma = require("@/prismaClient");


export async function getDefaultProfiles() {
  const profiles = await prisma.defaultprofile.findMany();
  return { profiles };
}


export async function updateDefaultProfiles(id: any, path: any) {
  try {
    const flag = await prisma.defaultprofile.update({
      where: { id },
      data: {
        profile: path,
      },
    })

    return { status: true, message: "Profile updated successfully", data: flag }
  } catch (err) {
    console.error("Error updating flag:", err)
    return { status: false, message: "Failed to update Profile" }
  }
}
