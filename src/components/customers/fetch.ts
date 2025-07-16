import * as logos from "@/assets/logos";
const prisma = require("../../prismaClient");


export async function getCustomers({
  page = 1,
  limit = 15,
  search = "",
  startDate,
  endDate,
}: {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {

  const offset = (page - 1) * limit;
  const [users, totalCount] = await Promise.all([
    prisma.users.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
      where: {
        isActive: true,
        isDelete: false,
        birthDate: {
          gte: new Date("1000-01-01"),
        },
        ...(startDate && endDate && {
          created_at: {
            gte: new Date(startDate),
            lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
          },
        }),
        OR: [
          {
            userRoles: {
              some: { roleId: 3 },
            },
          },
          {
            userRoles: {
              none: {},
            },
          },
        ],
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { contactNo: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        user_wallets: {
          select: {
            amount: true,
          },
        },
      },
    }),

    prisma.users.count({
      where: {
        isActive: true,
        isDelete: false,
        birthDate: {
          gte: new Date("1000-01-01"),
        },
        ...(startDate && endDate && {
          created_at: {
            gte: new Date(startDate),
            lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
          },
        }),
        OR: [
          {
            userRoles: {
              some: { roleId: 3 },
            },
          },
          {
            userRoles: {
              none: {},
            },
          },
        ],
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { contactNo: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
    })

  ]);

  const data = users.map((user: User) => {
    const balance = user.user_wallets.reduce((acc, item) => {
      return acc + Number(item.amount || 0);
    }, 0);

    return {
      ...user,
      balance,
    };
  });


  return {
    data,
    total: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}


type User = {
  id: bigint;
  name?: string;
  contactNo?: string;
  birthDate?: Date;
  birthTime?: string;
  profile?: string;
  user_wallets: {
    amount: number | string | null;
  }[];
};