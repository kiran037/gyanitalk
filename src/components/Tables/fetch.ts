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
}: {
  page?: number;
  limit?: number;
}) {
  const offset = (page - 1) * limit;


  const customers = await prisma.$queryRaw`
  SELECT * FROM users
  WHERE isActive = true
    AND isDelete = false
    AND (birthDate IS NULL OR birthDate >= '1000-01-01') -- skip 0000-00-00
    AND (
      EXISTS (
        SELECT 1 FROM user_roles WHERE user_roles.userId = users.id AND roleId = 3
      ) OR NOT EXISTS (
        SELECT 1 FROM user_roles WHERE user_roles.userId = users.id
      )
    )
  ORDER BY id DESC
  LIMIT ${limit} OFFSET ${offset}
`;



  const [totalCount] = await Promise.all([
   
    
    prisma.users.count({
      where: {
        isActive: true,
        isDelete: false,
        OR: [
          { userRoles: { some: { roleId: 3 } } },
          { userRoles: { none: {} } },
        ],
      },
    }),
  ]);


  return {
    data: customers,
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
