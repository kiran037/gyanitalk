"use server"
import { id } from "date-fns/locale";
import { NextResponse } from "next/server";
const prisma = require("../../prismaClient");

// ✅ Get all blogs
export async function getBlogsData(
  {
    page = 1,
    limit = 15,
    search = "",
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }) {

  const isNumericSearch = /^\d+$/.test(search);
  const isAlphaSearch = /[a-zA-Z]/.test(search);

  const offset = (page - 1) * limit;
  const baseWhere = {
    isActive: true,
    isDelete: false,

    ...(search &&
      isAlphaSearch && {
      title: { contains: search },
    }),
    ...(search &&
      isNumericSearch && {
      author: { contains: search },
    }),
  };

  // Get all blogs
  const [blogs, totalCount] = await Promise.all([
    prisma.blogs.findMany({
      where: {
        OR: [
          {
            title: {
              contains: search,
            },
          },
          {
            author: {
              contains: search,
            },
          },
          {
            description: {
              contains: search,
            },
          },
        ],
        isDelete: false
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        id: "desc",
      },
    }),
    prisma.blogs.count({
      where: {
          OR: [
            {
              title: {
                contains: search,
              },
            },
            {
              author: {
                contains: search,
              },
            },
            {
              description: {
                contains: search,
              },
            },
          ],
        },
    }),
  ]);

  const data = blogs.map((b: any) => ({
    ...b,
    created_at: b.created_at ? b.created_at.toISOString() : null,
    updated_at: b.updated_at ? b.updated_at.toISOString() : null,
  }));

  return {
    data,
    total: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}  

export async function getBlogs() {
  const data = await prisma.blogs.findMany({
    orderBy: { id: "desc" },
  });
  return {
    data,
  };
}

// Create new news
export async function createBlogs(payload: {
  title: string;
  author: string;
  postedOn: string;
  description: string;
  blogImage: string;
  extension: string;
  createdBy?: number;
}) {
  try {
    const created = await prisma.blogs.create({
      data: {
        title: payload.title,
        author: payload.author,
        postedOn: new Date(payload.postedOn), // ✅ correct
        description: payload.description,
        blogImage: payload.blogImage,
        previewImage: payload.blogImage,
        extension: payload.extension,
        isActive: true,
        isDelete: false,
        created_at: new Date(),
        updated_at: new Date(),
        createdBy: payload.createdBy ?? 1, // 👈 adjust with session user
        modifiedBy: payload.createdBy ?? 1,
      },
    });
    return { success: true, data: created };
  } catch (err: any) {
    console.error("createblogs error:", err);
    return { success: false, message: "Failed to create blogs" };
  }
}

// Update blogs
export async function updateBlogs(
  id: number,
  payload: {
    title: string;
    author: string;
    postedOn: string;
    description: string;
    blogImage: string;
    extension: string;
    modifiedBy?: number;
  }
) {
  try {
    const updated = await prisma.blogs.update({
      where: { id: BigInt(id) },
      data: {
        title: payload.title,
        author: payload.author,
        postedOn: new Date(payload.postedOn),
        description: payload.description,
        blogImage: payload.blogImage,
        previewImage: payload.blogImage,
        extension: payload.extension,
        updated_at: new Date(),
        modifiedBy: payload.modifiedBy ?? 1,
      },
    });
    return { success: true, data: updated };
  } catch (err: any) {
    console.error("updateBlogs error:", err);
    return { success: false, message: "Failed to update blogs" };
  }
}

export async function deleteBlogs(id: number) {
  try {
    const deleted = await prisma.blogs.update({
      where: { id: BigInt(id) },
      data: {
        isDelete: true,
        updated_at: new Date(),
      },
    });
    return { success: true, data: deleted };
  } catch (err: any) {
    console.error("deleteBlogs error:", err);
    return { success: false, message: "Failed to delete blogs" };
  }
}

//Toggle Active/Inactive
export async function updateBlogsStatus(
  id: number,
  isActive: boolean | number, // allow both
) {
  try {
    const updated = await prisma.blogs.update({
      where: { id: BigInt(id) },
      data: {
        isActive,
        updated_at: new Date(),
      },
    });
    return { success: true, data: updated };
  } catch (err: any) {
    console.error("updateBlogsStatus error:", err);
    return { success: false, message: "Failed to update status" };
  }
}