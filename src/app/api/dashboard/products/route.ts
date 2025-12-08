import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getDateRange,
  getPreviousDateRange,
  calculateComparison,
} from "../utils/dateFilter";
import { DashboardResponse } from "../utils/types";

// 👇 ADD THIS
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;

  // bigint → string
  if (typeof obj === "bigint") return obj.toString();

  // Prisma Decimal (class name "Decimal") → number
  if (
    typeof obj === "object" &&
    (obj as any).constructor &&
    (obj as any).constructor.name === "Decimal"
  ) {
    return Number((obj as any).toString());
  }

  // Date → ISO string
  if (obj instanceof Date) return obj.toISOString();

  // primitives
  if (typeof obj !== "object") return obj;

  // arrays
  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);

  // objects: recurse
  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertPrismaTypes(v);
  }
  return out;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter") || "last_30_days";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    const dateRange = getDateRange(filter, customStart || undefined, customEnd || undefined);
    const previousRange = getPreviousDateRange(dateRange);

    // Product Overview
    const [
      totalProducts,
      activeProducts,
      currentProductOrders,
      previousProductOrders,
      productRevenue,
      previousProductRevenue,
    ] = await Promise.all([
      // Total products
      prisma.astromall_products.count({
        where: { isDelete: false },
      }),

      // Active products
      prisma.astromall_products.count({
        where: { isActive: true, isDelete: false },
      }),

      // Current period product orders
      prisma.order_request.count({
        where: {
          orderType: "product",
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        },
      }),

      // Previous period product orders
      prisma.order_request.count({
        where: {
          orderType: "product",
          created_at: { gte: previousRange.startDate, lte: previousRange.endDate },
        },
      }),

      // Product revenue
      prisma.order_request.aggregate({
        where: {
          orderType: "product",
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          orderStatus: { not: "cancelled" },
        },
        _sum: { totalPayable: true },
      }),

      // Previous product revenue
      prisma.order_request.aggregate({
        where: {
          orderType: "product",
          created_at: { gte: previousRange.startDate, lte: previousRange.endDate },
          orderStatus: { not: "cancelled" },
        },
        _sum: { totalPayable: true },
      }),
    ]);

    const productOrdersComparison = calculateComparison(
      currentProductOrders,
      previousProductOrders
    );
    const productRevenueComparison = calculateComparison(
      Number(productRevenue._sum.totalPayable || 0),
      Number(previousProductRevenue._sum.totalPayable || 0)
    );

    // Best Selling Products
    const bestSellingProducts = await prisma.order_request.groupBy({
      by: ["productId"],
      where: {
        productId: { not: null },
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        orderStatus: { not: "cancelled" },
      },
      _count: true,
      _sum: { totalPayable: true },
      orderBy: { _count: { productId: "desc" } },
      take: 10,
    });

    const productIds = bestSellingProducts
      .map((p) => p.productId)
      .filter(Boolean) as bigint[];

    const productDetails = await prisma.astromall_products.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        productImage: true,
        amount: true,
        productCategoryId: true,
        product_category: { select: { name: true } },
      },
    });

    const bestSellingWithDetails = bestSellingProducts.map((product) => {
      const details = productDetails.find((d) => d.id === product.productId);
      return {
        id: product.productId,
        name: details?.name || "Unknown",
        image: details?.productImage,
        category: details?.product_category?.name,
        price: details?.amount,
        orders: product._count,
        revenue: Number(product._sum.totalPayable || 0),
      };
    });

    // Category-wise Revenue
    const categoryRevenue = await prisma.order_request.groupBy({
      by: ["productCategoryId"],
      where: {
        productCategoryId: { not: null },
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        orderStatus: { not: "cancelled" },
      },
      _sum: { totalPayable: true },
      _count: true,
    });

    const categoryIds = categoryRevenue
      .map((c) => c.productCategoryId)
      .filter(Boolean) as bigint[];

    const categoryDetails = await prisma.product_categories.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, categoryImage: true },
    });

    const categoryRevenueWithDetails = categoryRevenue.map((cat) => {
      const details = categoryDetails.find((d) => d.id === cat.productCategoryId);
      return {
        id: cat.productCategoryId,
        name: details?.name || "Unknown",
        image: details?.categoryImage,
        revenue: Number(cat._sum.totalPayable || 0),
        orders: cat._count,
      };
    });

    // Course Analytics
    const [
      totalCourses,
      currentCoursePurchases,
      previousCoursePurchases,
      courseRevenue,
      previousCourseRevenue,
    ] = await Promise.all([
      // Total courses
      prisma.courses.count(),

      // Current period course purchases
      prisma.course_purchase.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          status: 1,
        },
      }),

      // Previous period course purchases
      prisma.course_purchase.count({
        where: {
          created_at: { gte: previousRange.startDate, lte: previousRange.endDate },
          status: 1,
        },
      }),

      // Course revenue
      prisma.course_purchase.aggregate({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          status: 1,
        },
        _sum: { price: true },
      }),

      // Previous course revenue
      prisma.course_purchase.aggregate({
        where: {
          created_at: { gte: previousRange.startDate, lte: previousRange.endDate },
          status: 1,
        },
        _sum: { price: true },
      }),
    ]);

    const coursePurchasesComparison = calculateComparison(
      currentCoursePurchases,
      previousCoursePurchases
    );
    const courseRevenueComparison = calculateComparison(
      Number(courseRevenue._sum.price || 0),
      Number(previousCourseRevenue._sum.price || 0)
    );

    // Popular Courses
    const popularCourses = await prisma.course_purchase.groupBy({
      by: ["course_id"],
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        status: 1,
      },
      _count: true,
      _sum: { price: true },
      orderBy: { _count: { course_id: "desc" } },
      take: 10,
    });

    const courseIds = popularCourses.map((c) => c.course_id);
    const courseDetailsData = await prisma.courses.findMany({
      where: { id: { in: courseIds } },
      select: {
        id: true,
        name: true,
        image: true,
        price: true,
        offer_price: true,
        is_paid: true,
      },
    });

    const popularCoursesWithDetails = popularCourses.map((course) => {
      const details = courseDetailsData.find((d) => d.id === course.course_id);
      return {
        id: course.course_id,
        name: details?.name || "Unknown",
        image: details?.image,
        price: Number(details?.price || 0),
        offerPrice: Number(details?.offer_price || 0),
        enrollments: course._count,
        revenue: Number(course._sum.price || 0),
      };
    });

    // Product Suggestion Conversion
    const productSuggestions = await prisma.product_suggestions.count({
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
      },
    });

    // Daily Product Sales Trend
    const dailyProductSales = await prisma.$queryRaw<
      Array<{ date: Date; orders: number; revenue: number }>
    >`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(CAST(totalPayable AS DECIMAL(10,2))) as revenue
      FROM order_request
      WHERE created_at >= ${dateRange.startDate}
        AND created_at <= ${dateRange.endDate}
        AND orderType = 'product'
        AND orderStatus != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Featured vs Regular Products Performance
    const [featuredProducts, regularProducts] = await Promise.all([
      prisma.order_request.aggregate({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          product: { is_feature: true },
          orderStatus: { not: "cancelled" },
        },
        _count: true,
        _sum: { totalPayable: true },
      }),
      prisma.order_request.aggregate({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          product: { is_feature: false },
          orderStatus: { not: "cancelled" },
        },
        _count: true,
        _sum: { totalPayable: true },
      }),
    ]);

    const response: DashboardResponse = {
      success: true,
      data: {
        products: {
          summary: {
            totalProducts,
            activeProducts,
            orders: currentProductOrders,
            ordersComparison: productOrdersComparison,
            revenue: Number(productRevenue._sum.totalPayable || 0),
            revenueComparison: productRevenueComparison,
          },
          bestSelling: bestSellingWithDetails,
          categoryRevenue: categoryRevenueWithDetails,
          featuredVsRegular: {
            featured: {
              orders: featuredProducts._count,
              revenue: Number(featuredProducts._sum.totalPayable || 0),
            },
            regular: {
              orders: regularProducts._count,
              revenue: Number(regularProducts._sum.totalPayable || 0),
            },
          },
        },
        courses: {
          summary: {
            totalCourses,
            enrollments: currentCoursePurchases,
            enrollmentsComparison: coursePurchasesComparison,
            revenue: Number(courseRevenue._sum.price || 0),
            revenueComparison: courseRevenueComparison,
          },
          popular: popularCoursesWithDetails,
        },
        charts: {
          dailyProductSales: dailyProductSales.map((d) => ({
            date: d.date,
            orders: Number(d.orders),
            revenue: Number(d.revenue),
          })),
        },
        suggestions: {
          total: productSuggestions,
        },
      },
      metadata: {
        filter,
        dateRange,
        generatedAt: new Date().toISOString(),
        comparison: { previousRange },
      },
    };

    return NextResponse.json(convertPrismaTypes(response));
  } catch (error) {
    console.error("Products dashboard error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product analytics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}