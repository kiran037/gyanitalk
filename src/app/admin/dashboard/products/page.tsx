"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { StatCard } from "@/components/adminUI/StatCard";
import { DateFilterButtons } from "@/components/adminUI/DateFilterButtons";
import { LineChart } from "@/components/dashboard/charts/LineChart";
import { PieChart } from "@/components/dashboard/charts/PieChart";
import { BarChart } from "@/components/dashboard/charts/BarChart";
import { ShoppingBag, Package, TrendingUp, BookOpen, Star, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { avatar } from "@/lib/images";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

export default function ProductsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState("last_30_days");
  const [customDate, setCustomDate] = useState({ startDate: "", endDate: "" });

  const router = useRouter();

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const chartTitleColor = isDark ? "#F9FAFB" : "#111827";
  const chartTextColor = isDark ? "#9CA3AF" : "#4B5563";
  const chartGridColor = isDark
    ? "rgba(75,85,99,0.2)"
    : "rgba(209,213,219,0.6)";
  const tooltipBgColor = isDark
    ? "rgba(0,0,0,0.85)"
    : "rgba(249,250,251,0.98)";
  const tooltipTitleColor = isDark ? "#F9FAFB" : "#111827";
  const tooltipBodyColor = isDark ? "#E5E7EB" : "#1F2937";
  const tooltipBorderColor = "rgba(255,107,53,0.5)";

  const BackButton = () => (
    <button
      onClick={() => router.back()}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
    >
      <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
    </button>
  );

  useEffect(() => {
    fetchData();
  }, [filter, customDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter });
      if (filter === "custom" && customDate.startDate && customDate.endDate) {
        params.append("startDate", customDate.startDate);
        params.append("endDate", customDate.endDate);
      }

      const response = await fetch(`/api/dashboard/products?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch products data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Products & Courses Analytics"
          subtitle="Monitor product sales, course enrollments, and inventory performance"
          badge={{ text: "PRODUCTS", variant: "purple" }}
          leftActions={<BackButton />}
        />

        <DateFilterButtons
          activeFilter={filter}
          onFilterChange={setFilter}
          customDate={customDate}
          onCustomDateChange={setCustomDate}
        />

        {/* Products Summary Cards */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Products Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Products"
              value={data?.products.summary.totalProducts || 0}
              icon={<Package className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="Active Products"
              value={data?.products.summary.activeProducts || 0}
              icon={<ShoppingBag className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="Product Orders"
              value={data?.products.summary.orders || 0}
              icon={<TrendingUp className="w-5 h-5" />}
              trend={
                data?.products.summary.ordersComparison
                  ? {
                    value: data.products.summary.ordersComparison.changePercent,
                    isPositive: data.products.summary.ordersComparison.isIncrease,
                  }
                  : undefined
              }
              loading={loading}
            />
            <StatCard
              title="Product Revenue"
              value={formatCurrency(data?.products.summary.revenue || 0)}
              icon={<TrendingUp className="w-5 h-5" />}
              trend={
                data?.products.summary.revenueComparison
                  ? {
                    value: data.products.summary.revenueComparison.changePercent,
                    isPositive: data.products.summary.revenueComparison.isIncrease,
                  }
                  : undefined
              }
              loading={loading}
            />
          </div>
        </div>

        {/* Courses Summary Cards */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Courses Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Courses"
              value={data?.courses.summary.totalCourses || 0}
              icon={<BookOpen className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="Enrollments"
              value={data?.courses.summary.enrollments || 0}
              icon={<TrendingUp className="w-5 h-5" />}
              trend={
                data?.courses.summary.enrollmentsComparison
                  ? {
                    value: data.courses.summary.enrollmentsComparison.changePercent,
                    isPositive: data.courses.summary.enrollmentsComparison.isIncrease,
                  }
                  : undefined
              }
              loading={loading}
            />
            <StatCard
              title="Course Revenue"
              value={formatCurrency(data?.courses.summary.revenue || 0)}
              icon={<TrendingUp className="w-5 h-5" />}
              trend={
                data?.courses.summary.revenueComparison
                  ? {
                    value: data.courses.summary.revenueComparison.changePercent,
                    isPositive: data.courses.summary.revenueComparison.isIncrease,
                  }
                  : undefined
              }
              loading={loading}
            />
            <StatCard
              title="Product Suggestions"
              value={data?.suggestions.total || 0}
              icon={<Star className="w-5 h-5" />}
              loading={loading}
            />
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Daily Product Sales */}
          {!loading && data?.charts.dailyProductSales && (
            <LineChart
              data={{
                labels: data.charts.dailyProductSales.map((item: any) =>
                  new Date(item.date).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })
                ),
                datasets: [
                  {
                    label: "Revenue",
                    data: data.charts.dailyProductSales.map((item: any) => item.revenue),
                    borderColor: "rgba(255, 107, 53, 1)",
                  },
                ],
              }}
              title="Daily Product Sales"
              height={350}
              titleColor={chartTitleColor}
              textColor={chartTextColor}
              gridColor={chartGridColor}
              tooltipBgColor={tooltipBgColor}
              tooltipTitleColor={tooltipTitleColor}
              tooltipBodyColor={tooltipBodyColor}
              tooltipBorderColor={tooltipBorderColor}
            />
          )}

          {/* Featured vs Regular */}
          {!loading && data?.products.featuredVsRegular && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Featured vs Regular Products
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Featured Products
                    </span>
                    <span className="text-sm text-gray-500">
                      {data.products.featuredVsRegular.featured.orders} orders
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-[#FF6B35] mb-2">
                    {formatCurrency(data.products.featuredVsRegular.featured.revenue)}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] h-3 rounded-full"
                      style={{
                        width: `${(data.products.featuredVsRegular.featured.revenue /
                          (data.products.featuredVsRegular.featured.revenue +
                            data.products.featuredVsRegular.regular.revenue)) *
                          100
                          }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Regular Products
                    </span>
                    <span className="text-sm text-gray-500">
                      {data.products.featuredVsRegular.regular.orders} orders
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {formatCurrency(data.products.featuredVsRegular.regular.revenue)}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{
                        width: `${(data.products.featuredVsRegular.regular.revenue /
                          (data.products.featuredVsRegular.featured.revenue +
                            data.products.featuredVsRegular.regular.revenue)) *
                          100
                          }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Best Selling Products */}
        {!loading && data?.products.bestSelling && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FF6B35]" />
              Best Selling Products
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.products.bestSelling.map((product: any, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full flex items-center justify-center text-white font-bold text-xs">
                    #{index + 1}
                  </div>
                  <img
                    src={avatar(product.image)}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm line-clamp-2">
                    {product.name}
                  </h4>
                  <div className="text-xs text-gray-500 mb-2">{product.category}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-[#FF6B35]">
                      {formatCurrency(product.revenue)}
                    </div>
                    <div className="text-xs text-gray-500">{product.orders} orders</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Category Revenue & Popular Courses */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Category Revenue */}
          {!loading && data?.products.categoryRevenue && (
            <BarChart
              data={{
                labels: data.products.categoryRevenue.map((cat: any) => cat.name),
                datasets: [
                  {
                    label: "Revenue",
                    data: data.products.categoryRevenue.map((cat: any) => cat.revenue),
                  },
                ],
              }}
              title="Revenue by Category"
              height={350}
              horizontal
              titleColor={chartTitleColor}
              textColor={chartTextColor}
              gridColor={chartGridColor}
              tooltipBgColor={tooltipBgColor}
              tooltipTitleColor={tooltipTitleColor}
              tooltipBodyColor={tooltipBodyColor}
              tooltipBorderColor={tooltipBorderColor}
            />
          )}

          {/* Popular Courses */}
          {!loading && data?.courses.popular && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Popular Courses
              </h3>
              <div className="space-y-3">
                {data.courses.popular.map((course: any, index: number) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        #{index + 1}
                      </div>
                      <img
                        src={avatar(course.image)}
                        alt={course.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {course.name}
                        </div>
                        <div className="text-xs text-gray-500">{course.enrollments} enrollments</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-sm font-bold text-[#FF6B35]">
                        {formatCurrency(course.revenue)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}