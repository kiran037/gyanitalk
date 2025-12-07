"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { StatCard } from "@/components/adminUI/StatCard";
import { DateFilterButtons } from "@/components/adminUI/DateFilterButtons";
import { BarChart } from "@/components/dashboard/charts/BarChart";
import { PieChart } from "@/components/dashboard/charts/PieChart";
import { Tag, Users, Star, TrendingUp, Gift, Heart, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { avatar } from "@/lib/images";
import { useRouter } from "next/navigation";

export default function MarketingDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState("last_30_days");
  const [customDate, setCustomDate] = useState({ startDate: "", endDate: "" });

    const router = useRouter();

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

      const response = await fetch(`/api/dashboard/marketing?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch marketing data:", error);
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
          title="Marketing Analytics"
          subtitle="Track campaigns, coupons, referrals, and user engagement"
          badge={{ text: "MARKETING", variant: "orange" }}
          leftActions={<BackButton />}
        />

        <DateFilterButtons
          activeFilter={filter}
          onFilterChange={setFilter}
          customDate={customDate}
          onCustomDateChange={setCustomDate}
        />

        {/* Coupon Summary */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Coupon Performance
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Active Coupons"
              value={data?.coupons.summary.activeCoupons || 0}
              icon={<Tag className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="Total Usages"
              value={data?.coupons.summary.usages || 0}
              icon={<TrendingUp className="w-5 h-5" />}
              trend={
                data?.coupons.summary.usageComparison
                  ? {
                      value: data.coupons.summary.usageComparison.changePercent,
                      isPositive: data.coupons.summary.usageComparison.isIncrease,
                    }
                  : undefined
              }
              loading={loading}
            />
            <StatCard
              title="Total Discount Given"
              value={formatCurrency(data?.coupons.summary.totalDiscount || 0)}
              icon={<Tag className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="Coupon ROI"
              value={`${data?.coupons.roi.roi.toFixed(1) || 0}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              loading={loading}
            />
          </div>
        </div>

        {/* Referral Summary */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Referral Program
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Referrals"
              value={data?.referrals.summary.totalReferrals || 0}
              icon={<Users className="w-5 h-5" />}
              trend={
                data?.referrals.summary.comparison
                  ? {
                      value: data.referrals.summary.comparison.changePercent,
                      isPositive: data.referrals.summary.comparison.isIncrease,
                    }
                  : undefined
              }
              loading={loading}
            />
            <StatCard
              title="Referral Revenue"
              value={formatCurrency(data?.referrals.summary.revenue || 0)}
              icon={<TrendingUp className="w-5 h-5" />}
              trend={
                data?.referrals.summary.revenueComparison
                  ? {
                      value: data.referrals.summary.revenueComparison.changePercent,
                      isPositive: data.referrals.summary.revenueComparison.isIncrease,
                    }
                  : undefined
              }
              loading={loading}
            />
            <StatCard
              title="Cashback Given"
              value={formatCurrency(data?.referrals.summary.cashbackGiven || 0)}
              icon={<Gift className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="Conversion Rate"
              value={`${data?.referrals.conversionRate.toFixed(1) || 0}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              loading={loading}
            />
          </div>
        </div>

        {/* Top Performing Coupons */}
        {!loading && data?.coupons.topPerforming && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#FF6B35]" />
              Top Performing Coupons
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Code
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Type
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Discount
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Usages
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Total Discount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.coupons.topPerforming.map((coupon: any, index: number) => (
                    <motion.tr
                      key={coupon.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-3 px-4 text-sm">
                        <span className="font-mono font-bold text-[#FF6B35]">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {coupon.discountType}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}%`
                          : formatCurrency(coupon.discountValue)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                        {coupon.usageCount}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-[#FF6B35]">
                        {formatCurrency(coupon.totalDiscount)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Referrers & Reviews */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Referrers */}
          {!loading && data?.referrals.topReferrers && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#FF6B35]" />
                Top Referrers
              </h3>
              <div className="space-y-3">
                {data.referrals.topReferrers.map((referrer: any, index: number) => (
                  <motion.div
                    key={referrer.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full flex items-center justify-center text-white font-bold text-xs">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          User #{referrer.userId}
                        </div>
                        <div className="text-xs text-gray-500">
                          {referrer.referrals} referrals
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#FF6B35]">
                        {formatCurrency(referrer.revenue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Cashback: {formatCurrency(referrer.cashback)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Distribution */}
          {!loading && data?.reviews.distribution && (
            <PieChart
              data={{
                labels: data.reviews.distribution.map((r: any) => `${r.rating} Stars`),
                data: data.reviews.distribution.map((r: any) => r.count),
              }}
              title={`Reviews Distribution (Avg: ${data.reviews.averageRating.toFixed(1)})`}
              height={350}
            />
          )}
        </div>

        {/* Follower Growth & Gifts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Most Followed Astrologers */}
          {!loading && data?.followers.mostFollowed && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#FF6B35]" />
                Most Followed Astrologers
              </h3>
              <div className="space-y-3">
                {data.followers.mostFollowed.map((astro: any, index: number) => (
                  <motion.div
                    key={astro.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={avatar(astro.profileImage)}
                        alt={astro.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {astro.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {astro.followers} followers
                        </div>
                      </div>
                    </div>
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Gifts Summary */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#FF6B35]" />
              Gift Analytics
            </h3>
            <div className="space-y-6">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Total Gifts Sent
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {data?.gifts.totalGifts || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Total Gift Amount
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                  {formatCurrency(data?.gifts.totalAmount || 0)}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  New Followers This Period
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data?.followers.newFollowers || 0}
                  </div>
                  {data?.followers.comparison && (
                    <div
                      className={`text-sm font-medium ${
                        data.followers.comparison.isIncrease
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {data.followers.comparison.isIncrease ? "+" : ""}
                      {data.followers.comparison.changePercent.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coupon ROI Details */}
        {!loading && data?.coupons.roi && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Coupon ROI Analysis
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Revenue Generated
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(data.coupons.roi.revenueGenerated)}
                </div>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Discount Given
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(data.coupons.roi.discountGiven)}
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Return on Investment</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {data.coupons.roi.roi.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}