"use server"
const prisma = require("../../prismaClient");

/*══════════════════════════════════════════════════════════╗
║                     COURSES  MODULE                      ║
╚══════════════════════════════════════════════════════════*/

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




/*══════════════════════════════════════════════════════════╗
║                     CATEGORY  MODULE                      ║
╚══════════════════════════════════════════════════════════*/



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




/*══════════════════════════════════════════════════════════╗
║                      CHAPTER MODULE                       ║
╚══════════════════════════════════════════════════════════*/



export async function getChapters() {
  const chapters = await prisma.chapters.findMany({
    include: {
      course: {
        select: {
          name: true
        }
      },
    },
  });
  return { chapters };
}



export async function createChapter(data: any) {

  try {
    const chapter = await prisma.chapters.create({
      data: {
        course_id: data.course_id || null,
        title: data.title || "",
        description: data.description || "",
        is_paid: data.is_paid || 0,

        // Image fields
        image: data.image || null,
        image_type: data.image_type || null,

        // PDF fields
        pdf: data.pdf || null,
        pdf_type: data.pdf_type || null,

        // Video fields
        video: data.video || null,
        video_type: data.video_type || null,
        video_format: data.video_format || null,
      },
    });

    return { success: true, chapter };
  } catch (error: any) {
    console.error("Error creating chapter:", error);
    return { success: false, message: error.message };
  }
}




export async function deleteChapters(id: number) {
  try {
    await prisma.chapters.delete({
      where: { id },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return { success: false, message: error.message };
  }
}



export async function updateChapter(id: number, data: any) {

  try {
    const updated = await prisma.chapters.update({
      where: { id },
      data: {
        course_id: data.course_id || null,
        title: data.title || "",
        description: data.description || "",
        is_paid: data.is_paid || 0,

        // Image fields
        image: data.image || null,
        image_type: data.image_type || null,

        // PDF fields
        pdf: data.pdf || null,
        pdf_type: data.pdf_type || null,

        // Video fields
        video: data.video || null,
        video_type: data.video_type || null,
        video_format: data.video_format || null,
      },
    });

    return { success: true, chapter: updated };
  } catch (error: any) {
    console.error("Error updating chapter:", error);
    return { success: false, message: error.message };
  }
}
