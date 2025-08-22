"use server"
const prisma = require("../../prismaClient");

export async function getCourses() {
  const courses = await prisma.courses.findMany({
    include: {
      category: true,
    },
  }); const serializedCourses = courses.map((course: any) => ({
    ...course,
    price: course.price ? Number(course.price) : null,
    offer_price: course.offer_price ? Number(course.offer_price) : null,
  }));

  return { courses: serializedCourses };
}




export async function deleteCourses(id: number) {
  try {
    await prisma.courses.delete({
      where: { id },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting course:", error);
    return { success: false, message: error.message };
  }
}


export async function updateCourse(id: number, data: any) {
  try {
    const updatedCourse = await prisma.courses.update({
      where: { id },
      data,
    });

    return { success: true, course: updatedCourse };
  } catch (error: any) {
    console.error("Error updating course:", error);
    return { success: false, message: error.message };
  }
}


export async function createCourse(data: any) {
  try {
    const course = await prisma.courses.create({
      data: {
        name: data.name,
        category_id: data.category_id || null,
        price: data.price || 0,
        offer_price: data.offer_price || 0,
        is_paid: data.is_paid || 0,
        description: data.description || "",
        image: data.image || null,
      },
    });

    return { success: true, course };
  } catch (error: any) {
    console.error("Error creating course:", error);
    return { success: false, message: error.message };
  }
}


export async function getCategories() {
  const categories = await prisma.categories.findMany();
  return { categories };
}


export async function deleteCategory(id: number) {
  try {
    await prisma.categories.delete({
      where: { id },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return { success: false, message: error.message };
  }
} 



export async function updateCategory(id: number, data: any) {
  try {
    const updatedCourse = await prisma.categories.update({
      where: { id },
      data,
    });

    return { success: true, course: updatedCourse };
  } catch (error: any) {
    console.error("Error updating Category:", error);
    return { success: false, message: error.message };
  }
}


export async function createCategory(data: any) {
  try {
    const categories = await prisma.categories.create({
      data: {
        name: data.name,
        image: data.image || null,
      },
    });

    return { success: true, categories };
  } catch (error: any) {
    console.error("Error creating Category:", error);
    return { success: false, message: error.message };
  }
}