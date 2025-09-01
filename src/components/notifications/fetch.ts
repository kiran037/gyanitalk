"use server"
const prisma = require("../../prismaClient");

export async function getNotifications() {
  
  const [notifications] = await Promise.all([
    prisma.notifications.findMany({
      orderBy: { id: "desc" },
    }),
  ]);

  // ✅ Format Date objects into strings
  const data = notifications.map((n: any) => ({
    ...n,
    created_at: n.created_at ? n.created_at.toISOString() : null,
  }));

  return {
    data,
  };
}
