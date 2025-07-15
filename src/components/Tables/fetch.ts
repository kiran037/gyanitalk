import * as logos from "@/assets/logos";
const prisma = require("../../prismaClient");

export async function getTopProducts() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return [
    {
      image: "/images/product/product-01.png",
      name: "Apple Watch Series 7",
      category: "Electronics",
      price: 296,
      sold: 22,
      profit: 45,
    },
    {
      image: "/images/product/product-02.png",
      name: "Macbook Pro M1",
      category: "Electronics",
      price: 546,
      sold: 12,
      profit: 125,
    },
    {
      image: "/images/product/product-03.png",
      name: "Dell Inspiron 15",
      category: "Electronics",
      price: 443,
      sold: 64,
      profit: 247,
    },
    {
      image: "/images/product/product-04.png",
      name: "HP Probook 450",
      category: "Electronics",
      price: 499,
      sold: 72,
      profit: 103,
    },
  ];
}

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

  if (startDate && endDate) {
    console.log("Filter Date Range:", {
      from: new Date(startDate),
      to: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
    });
  }

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

export async function getTopChannels() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return [
    {
      name: "Google",
      visitors: 3456,
      revenues: 4220,
      sales: 3456,
      conversion: 2.59,
      logo: logos.google,
    },
    {
      name: "X.com",
      visitors: 3456,
      revenues: 4220,
      sales: 3456,
      conversion: 2.59,
      logo: logos.x,
    },
    {
      name: "Github",
      visitors: 3456,
      revenues: 4220,
      sales: 3456,
      conversion: 2.59,
      logo: logos.github,
    },
    {
      name: "Vimeo",
      visitors: 3456,
      revenues: 4220,
      sales: 3456,
      conversion: 2.59,
      logo: logos.vimeo,
    },
    {
      name: "Facebook",
      visitors: 3456,
      revenues: 4220,
      sales: 3456,
      conversion: 2.59,
      logo: logos.facebook,
    },
  ];
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