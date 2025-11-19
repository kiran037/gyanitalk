///Users/xeoren/gyanitallk-admin/src/app/dashboard/page.tsx
export const dynamic = "force-dynamic";

// src/app/dashboard/page.tsx
import { unstable_cache } from "next/cache";
import Link from "next/link";
import React from "react";
import { getDashboardOverview, getDashboardChartData } from "./fetch";
import ChartClient from "./ChartsClient";
import {
  Users,
  Sparkles,
  Radio,
  IndianRupee,
  CreditCard,
  Phone,
  MessageCircle,
  Brain,
  UserPlus,
  TrendingUp,
  Activity,
} from "lucide-react";

type ChartApiResponse = {
  labels: string[];
  callData: number[];
  chatData: number[];
  earningData: number[];
  userData: number[];
};

const getOverviewCached = unstable_cache(
  async () => getDashboardOverview(),
  ["dashboard:overview:v1"],
  { revalidate: 30, tags: ["dashboard:overview"] }
);

const getChartCached = unstable_cache(
  async () => getDashboardChartData(),
  ["dashboard:charts:v1"],
  { revalidate: 300, tags: ["dashboard:charts"] }
);

const fmt = (v: any) => Number(v ?? 0).toLocaleString("en-IN");
const n = (v: any) => Number(v ?? 0);

export default async function Home() {
  // ---- Keep your backend integrations intact ----
  const [data, chart] = await Promise.all([
    getOverviewCached(),
    getChartCached() as Promise<ChartApiResponse>,
  ]);

  // Build today's date in IST (YYYY-MM-DD) for query params
  const todayParam = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" })
    .format(new Date());
  const qsToday = `?search=&startDate=${todayParam}&endDate=${todayParam}`;

  const hrefCustomersToday = `/customers${qsToday}`;
  const hrefWalletToday = `/wallet${qsToday}`;
  const hrefPaymentsToday = `/payments${qsToday}`;


  // ---- Derived for top 3 cards (all based on real data) ----
  const totalIncome = n(data.totalEarning);
  const totalExpense = n(data.totalWithdraw);
  const totalBalance = Math.max(totalIncome - totalExpense, 0);

  // Request totals for micro-metrics
  const totalRequests = n(data.totalCallRequest) + n(data.totalChatRequest);

  // Donut chart = meaningful distribution from your live metrics
  const donutSeries = [
    n(data.totalLiveChat),
    n(data.totalLiveCall),
    n(data.totalDeposit?.success),
    n(data.todayEarning),
    n(data.todayWithdraw),
  ];
  const donutLabels = [
    "Live Chat",
    "Live Call",
    "Deposits (success)",
    "Today Earnings",
    "Today Withdraw",
  ];

  // ---- Charts (serializable options, no functions) ----
  // NOTE: Axis/grid colors use CSS variables so they switch with dark mode.
  const axisColor = "var(--axis-color)";
  const gridColor = "var(--grid-color)";

  const areaOptions = {
    chart: { toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: "smooth" as const, width: 3 },
    dataLabels: { enabled: false },
    grid: { borderColor: gridColor },
    legend: { show: true, labels: { colors: axisColor } },
    colors: ["#6C5CE7"],
    fill: {
      type: "gradient" as const,
      gradient: { shadeIntensity: 0.4, opacityFrom: 0.6, opacityTo: 0.05, stops: [0, 90, 100] },
    },
    xaxis: {
      categories: chart.labels,
      labels: { rotate: -45, style: { fontSize: "11px", colors: axisColor } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: axisColor } } },
    tooltip: { shared: true, intersect: false },
  };
  const areaSeries = [{ name: "Earnings", data: chart.earningData }];

  const barOptions = {
    chart: { toolbar: { show: false }, zoom: { enabled: false } },
    dataLabels: { enabled: false },
    grid: { borderColor: gridColor },
    legend: { show: true, labels: { colors: axisColor } },
    colors: ["#7C83FD", "#B3B8FF"],
    plotOptions: { bar: { columnWidth: "32%", borderRadius: 8 } },
    xaxis: {
      categories: chart.labels,
      labels: { rotate: -45, style: { fontSize: "11px", colors: axisColor } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: axisColor } }, title: { text: "Requests", style: { color: axisColor } } },
    tooltip: { shared: true, intersect: false },
  };
  const barSeries = [
    { name: "Chat", data: chart.chatData },
    { name: "Call", data: chart.callData },
  ];

  const donutOptions = {
    labels: donutLabels,
    legend: { position: "bottom" as const, labels: { colors: axisColor } },
    stroke: { width: 2 },
    dataLabels: { enabled: false },
    colors: ["#6C5CE7", "#8E9AFE", "#B3B8FF", "#C9D6FF", "#E4E8FF"],
    tooltip: {},
  };

  return (
    <div
      className="
        min-h-screen
        text-[13px] sm:text-[13.5px] md:text-[14px] leading-[1.35] tracking-tight
        bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20
        dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/10
        [--axis-color:#6b7280] [--grid-color:rgba(0,0,0,0.06)]
        dark:[--axis-color:#9ca3af] dark:[--grid-color:rgba(255,255,255,0.08)]
        relative overflow-hidden
      "
    >
      {/* subtle animated background (smaller) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr from-purple-400/10 to-pink-400/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[280px] bg-gradient-to-r from-blue-300/5 via-purple-300/3 to-pink-300/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative space-y-6 p-4 lg:p-6">
        {/* ===== Header ===== */}
        <div
          className="
            backdrop-blur-2xl backdrop-saturate-150
            bg-white/40 dark:bg-black/20
            border border-white/20 dark:border-white/10
            rounded-2xl p-5
            shadow-[0_6px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.3)]
            relative overflow-hidden
          "
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/[0.05] dark:via-white/[0.02] dark:to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse" />
              <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse delay-300" />
              <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse delay-700" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium">
              Real-time insights and comprehensive platform overview
            </p>
          </div>
        </div>

        {/* ===== Hero Metrics ===== */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Total Balance */}
          <div
            className="
              group relative overflow-hidden
              backdrop-blur-2xl backdrop-saturate-150
              bg-gradient-to-br from-white/60 via-white/40 to-white/20
              dark:from-white/[0.08] dark:via-white/[0.05] dark:to-white/[0.02]
              border border-white/30 dark:border-white/[0.08]
              rounded-2xl p-5
              shadow-[0_6px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.3)]
              hover:shadow-[0_10px_28px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_10px_28px_rgba(0,0,0,0.4)]
              hover:scale-[1.01] hover:-translate-y-[2px]
              transition-all duration-400 ease-out
            "
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-blue-500/5 dark:from-violet-400/[0.08] dark:to-blue-400/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[12px] font-semibold text-gray-600 dark:text-gray-400 tracking-wide uppercase">Total Balance</p>
                  <h3 className="mt-2 text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    ₹{fmt(totalBalance)}
                  </h3>
                </div>
                <div
                  className="
                    flex items-center justify-center w-12 h-12
                    bg-gradient-to-br from-violet-500/20 to-blue-500/20
                    dark:from-violet-400/20 dark:to-blue-400/20
                    backdrop-blur-xl rounded-xl
                    border border-white/20 dark:border-white/10
                    group-hover:scale-110 group-hover:rotate-6
                    transition-all duration-300
                  "
                >
                  <span className="text-lg font-bold text-violet-600 dark:text-violet-400">
                    <IndianRupee size={28} />
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-[30%_70%] gap-2 items-stretch">
                {/* LEFT 30% */}
                <div className="backdrop-blur-xl bg-white/40 dark:bg-white/[0.05] border border-white/20 dark:border-white/[0.08] rounded-lg p-2 text-center h-full flex flex-col justify-center leading-snug">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Currency</p>
                  <p className="text-[13px] font-bold text-gray-900 dark:text-gray-100 mt-0.5 tabular-nums">INR</p>
                </div>

                {/* RIGHT 70% (two rows) */}
                <div className="grid grid-rows-2 gap-2 h-full">
                  <div className="backdrop-blur-xl bg-white/40 dark:bg-white/[0.05] border border-white/20 dark:border-white/[0.08] rounded-lg p-2 text-center flex flex-col justify-center leading-snug">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Requests</p>
                    <p className="text-[13px] font-bold text-gray-900 dark:text-gray-100 mt-0.5 tabular-nums">{fmt(totalRequests)}</p>
                  </div>
                  <div className="backdrop-blur-xl bg-white/40 dark:bg-white/[0.05] border border-white/20 dark:border-white/[0.08] rounded-lg p-2 text-center flex flex-col justify-center leading-snug">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Categories</p>
                    <p className="text-[13px] font-bold text-gray-900 dark:text-gray-100 mt-0.5 tabular-nums">
                      {donutSeries.filter(v => v > 0).length}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Income */}
          <div
            className="
              group relative overflow-hidden
              backdrop-blur-2xl backdrop-saturate-150
              bg-gradient-to-br from-white/60 via-white/40 to-white/20
              dark:from-white/[0.08] dark:via-white/[0.05] dark:to-white/[0.02]
              border border-white/30 dark:border-white/[0.08]
              rounded-2xl p-5
              shadow-[0_6px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.3)]
              hover:shadow-[0_10px_28px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_10px_28px_rgba(0,0,0,0.4)]
              hover:scale-[1.01] hover:-translate-y-[2px]
              transition-all duration-400 ease-out
            "
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/5 dark:from-emerald-400/[0.08] dark:to-cyan-400/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[12px] font-semibold text-gray-600 dark:text-gray-400 tracking-wide uppercase">Income</p>
                  <h3 className="mt-2 text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    ₹{fmt(totalIncome)}
                  </h3>
                </div>
                <div
                  className="
                    flex items-center justify-center w-12 h-12
                    bg-gradient-to-br from-emerald-500/20 to-cyan-500/20
                    dark:from-emerald-400/20 dark:to-cyan-400/20
                    backdrop-blur-xl rounded-xl
                    border border-white/20 dark:border-white/10
                    group-hover:scale-110 group-hover:rotate-6
                    transition-all duration-300
                  "
                >
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    <TrendingUp size={28} />
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-[30%_70%] gap-2 items-stretch">
                {/* LEFT 30% */}
                <div className="backdrop-blur-xl bg-white/40 dark:bg-white/[0.05] border border-white/20 dark:border-white/[0.08] rounded-lg p-2 text-center h-full flex flex-col justify-center leading-snug">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Today</p>
                  <p className="text-[13px] font-bold text-gray-900 dark:text-gray-100 mt-0.5 tabular-nums">₹{fmt(data.todayEarning)}</p>
                </div>

                {/* RIGHT 70% (two rows) */}
                <div className="grid grid-rows-2 gap-2 h-full">
                  <div className="backdrop-blur-xl bg-white/40 dark:bg-white/[0.05] border border-white/20 dark:border-white/[0.08] rounded-lg p-2 text-center flex flex-col justify-center leading-snug">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Astro</p>
                    <p className="text-[13px] font-bold text-gray-900 dark:text-gray-100 mt-0.5 tabular-nums">₹{fmt(data.totalAstroEarning)}</p>
                  </div>
                  <div className="backdrop-blur-xl bg-white/40 dark:bg-white/[0.05] border border-white/20 dark:border-white/[0.08] rounded-lg p-2 text-center flex flex-col justify-center leading-snug">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Orders</p>
                    <p className="text-[13px] font-bold text-gray-900 dark:text-gray-100 mt-0.5 tabular-nums">{fmt(data.totalOrders)}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Expense */}
          <div
            className="
              group relative overflow-hidden
              backdrop-blur-2xl backdrop-saturate-150
              bg-gradient-to-br from-white/60 via-white/40 to-white/20
              dark:from-white/[0.08] dark:via-white/[0.05] dark:to-white/[0.02]
              border border-white/30 dark:border-white/[0.08]
              rounded-2xl p-5
              shadow-[0_6px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.3)]
              hover:shadow-[0_10px_28px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_10px_28px_rgba(0,0,0,0.4)]
              hover:scale-[1.01] hover:-translate-y-[2px]
              transition-all duration-400 ease-out
            "
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-pink-500/5 dark:from-rose-400/[0.08] dark:to-pink-400/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[12px] font-semibold text-gray-600 dark:text-gray-400 tracking-wide uppercase">Expense</p>
                  <h3 className="mt-2 text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    ₹{fmt(totalExpense)}
                  </h3>
                </div>
                <div
                  className="
                    flex items-center justify-center w-12 h-12
                    bg-gradient-to-br from-rose-500/20 to-pink-500/20
                    dark:from-rose-400/20 dark:to-pink-400/20
                    backdrop-blur-xl rounded-xl
                    border border-white/20 dark:border-white/10
                    group-hover:scale-110 group-hover:rotate-6
                    transition-all duration-300
                  "
                >
                  <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                    <Activity size={28} />
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-[30%_70%] gap-2 items-stretch">
                {/* LEFT 30% */}
                <div className="backdrop-blur-xl bg-white/40 dark:bg-white/[0.05] border border-white/20 dark:border-white/[0.08] rounded-lg p-2 text-center h-full flex flex-col justify-center leading-snug">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Today</p>
                  <p className="text-[13px] font-bold text-gray-900 dark:text-gray-100 mt-0.5 tabular-nums">₹{fmt(data.todayWithdraw)}</p>
                </div>

                {/* RIGHT 70% (two rows) */}
                <div className="grid grid-rows-2 gap-2 h-full">
                  <div className="backdrop-blur-xl bg-white/40 dark:bg-white/[0.05] border border-white/20 dark:border-white/[0.08] rounded-lg p-2 text-center flex flex-col justify-center leading-snug">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Deposits</p>
                    <p className="text-[13px] font-bold text-gray-900 dark:text-gray-100 mt-0.5 tabular-nums">₹{fmt(data.totalDeposit?.success)}</p>
                  </div>
                  <div className="backdrop-blur-xl bg-white/40 dark:bg-white/[0.05] border border-white/20 dark:border-white/[0.08] rounded-lg p-2 text-center flex flex-col justify-center leading-snug">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Pending</p>
                    <p className="text-[13px] font-bold text-gray-900 dark:text-gray-100 mt-0.5 tabular-nums">₹{fmt(data.totalDeposit?.pending)}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ===== Overview Section ===== */}
        <div className="space-y-6">
          <div
            className="
              backdrop-blur-2xl backdrop-saturate-150
              bg-white/30 dark:bg-black/10
              border border-white/20 dark:border-white/10
              rounded-2xl p-4
              shadow-[0_6px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.3)]
            "
          >
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              System Overview
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-0.5">Comprehensive platform metrics and insights</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-5 auto-rows-[1fr]">
              {/* Customers (CLICK → /customers) */}
              <Link
                href="/customers"
                className="block group relative h-full rounded-2xl border border-white/15 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] backdrop-blur-xl shadow-[0_6px_18px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.28)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_10px_26px_rgba(0,0,0,0.38)] hover:-translate-y-[2px] transition-all duration-300 overflow-hidden p-4 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                aria-label="Open Customers"
              >
                {/* animated overlay */}
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute -top-14 -right-20 size-36 rounded-full bg-blue-500/12 blur-2xl animate-pulse" />
                  <div className="absolute -bottom-16 -left-16 size-28 rounded-full bg-indigo-500/10 blur-2xl animate-pulse delay-1000" />
                  {/* shine sweep */}
                  <div className="absolute inset-y-0 -left-1 w-1/3 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-[120%] group-hover:translate-x-[220%] transition-transform duration-700 ease-out" />
                </div>

                <header className="relative flex items-center gap-2">
                  <div className="size-8 rounded-lg border border-white/20 dark:border-white/10 bg-gradient-to-br from-blue-500/18 to-blue-600/18 flex items-center justify-center transform-gpu transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Users size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Customers</h3>
                </header>

                <dl className="mt-3 divide-y divide-white/10 dark:divide-white/5 text-[13px] leading-tight font-medium">
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Total</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">{fmt(data.totalCustomer)}</dd>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Active</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">{fmt(data.totalActiveCustomer)}</dd>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Reports</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">{fmt(data.totalReportRequest)}</dd>
                  </div>
                </dl>
              </Link>

              {/* Astrologers (CLICK → /(astrologers)/astrologers) */}
              <Link
                href="/astrologers"
                className="block group relative h-full rounded-2xl border border-white/15 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] backdrop-blur-xl shadow-[0_6px_18px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.28)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_10px_26px_rgba(0,0,0,0.38)] hover:-translate-y-[2px] transition-all duration-300 overflow-hidden p-4 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
                aria-label="Open Astrologers"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute -top-14 -right-20 size-36 rounded-full bg-purple-500/12 blur-2xl animate-pulse" />
                  <div className="absolute -bottom-16 -left-16 size-28 rounded-full bg-fuchsia-500/10 blur-2xl animate-pulse delay-1000" />
                  <div className="absolute inset-y-0 -left-1 w-1/3 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-[120%] group-hover:translate-x-[220%] transition-transform duration-700 ease-out" />
                </div>

                <header className="relative flex items-center gap-2">
                  <div className="size-8 rounded-lg border border-white/20 dark:border-white/10 bg-gradient-to-br from-purple-500/18 to-purple-600/18 flex items-center justify-center transform-gpu transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Astrologers</h3>
                </header>

                <dl className="mt-3 divide-y divide-white/10 dark:divide-white/5 text-[13px] leading-tight font-medium">
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Total</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">{fmt(data.totalAstrologer)}</dd>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Unverified</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">{fmt(data.unverifiedAstrologer)}</dd>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Orders</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">{fmt(data.totalOrders)}</dd>
                  </div>
                </dl>
              </Link>

              {/* Live Activity (unchanged / not clickable) */}
              <section className="group relative h-full rounded-2xl border border-white/15 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] backdrop-blur-xl shadow-[0_6px_18px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.28)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_10px_26px_rgba(0,0,0,0.38)] hover:-translate-y-[2px] transition-all duration-300 overflow-hidden p-4">
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute -top-14 -right-20 size-36 rounded-full bg-emerald-500/12 blur-2xl animate-pulse" />
                  <div className="absolute -bottom-16 -left-16 size-28 rounded-full bg-green-500/10 blur-2xl animate-pulse delay-1000" />
                  <div className="absolute inset-y-0 -left-1 w-1/3 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-[120%] group-hover:translate-x-[220%] transition-transform duration-700 ease-out" />
                </div>

                <header className="relative flex items-center gap-2">
                  <div className="size-8 rounded-lg border border-white/20 dark:border-white/10 bg-gradient-to-br from-emerald-500/18 to-emerald-600/18 flex items-center justify-center transform-gpu transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Radio size={18} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Live Activity</h3>
                </header>

                <dl className="mt-3 divide-y divide-white/10 dark:divide-white/5 text-[13px] leading-tight font-medium">
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Live Astro</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">{fmt(data.totalLiveAstro)}</dd>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Live Chat</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">{fmt(data.totalLiveChat)}</dd>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Live Call</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">{fmt(data.totalLiveCall)}</dd>
                  </div>
                </dl>
              </section>

              {/* Earnings (CLICK → /withdrawal_requests) */}
              <Link
                href="/withdrawal_requests"
                className="block group relative h-full rounded-2xl border border-white/15 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] backdrop-blur-xl shadow-[0_6px_18px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.28)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_10px_26px_rgba(0,0,0,0.38)] hover:-translate-y-[2px] transition-all duration-300 overflow-hidden p-4 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                aria-label="Open Earnings / Withdrawal Requests"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute -top-14 -right-20 size-36 rounded-full bg-amber-500/12 blur-2xl animate-pulse" />
                  <div className="absolute -bottom-16 -left-16 size-28 rounded-full bg-orange-500/10 blur-2xl animate-pulse delay-1000" />
                  <div className="absolute inset-y-0 -left-1 w-1/3 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-[120%] group-hover:translate-x-[220%] transition-transform duration-700 ease-out" />
                </div>

                <header className="relative flex items-center gap-2">
                  <div className="size-8 rounded-lg border border-white/20 dark:border-white/10 bg-gradient-to-br from-amber-500/18 to-amber-600/18 flex items-center justify-center transform-gpu transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <IndianRupee size={18} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Earnings</h3>
                </header>

                <dl className="mt-3 divide-y divide-white/10 dark:divide-white/5 text-[13px] leading-tight font-medium">
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Total</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">₹{fmt(data.totalEarning)}</dd>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Astro Total</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">₹{fmt(data.totalAstroEarning)}</dd>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Withdraw</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">₹{fmt(data.totalWithdraw)}</dd>
                  </div>
                </dl>
              </Link>

              {/* Deposits (CLICK → /(transactions)/wallet) */}
              <Link
                href="/wallet"
                className="block group relative h-full rounded-2xl border border-white/15 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] backdrop-blur-xl shadow-[0_6px_18px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.28)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_10px_26px_rgba(0,0,0,0.38)] hover:-translate-y-[2px] transition-all duration-300 overflow-hidden p-4 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                aria-label="Open Deposits / Wallet"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute -top-14 -right-20 size-36 rounded-full bg-cyan-500/12 blur-2xl animate-pulse" />
                  <div className="absolute -bottom-16 -left-16 size-28 rounded-full bg-sky-500/10 blur-2xl animate-pulse delay-1000" />
                  <div className="absolute inset-y-0 -left-1 w-1/3 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-[120%] group-hover:translate-x-[220%] transition-transform duration-700 ease-out" />
                </div>

                <header className="relative flex items-center gap-2">
                  <div className="size-8 rounded-lg border border-white/20 dark:border-white/10 bg-gradient-to-br from-cyan-500/18 to-cyan-600/18 flex items-center justify-center transform-gpu transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <CreditCard size={18} className="text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Deposits</h3>
                </header>

                <dl className="mt-3 divide-y divide-white/10 dark:divide-white/5 text-[13px] leading-tight font-medium">
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Total</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">₹{fmt(n(data.totalDeposit?.success) + n(data.totalDeposit?.pending))}</dd>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Success</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">₹{fmt(data.totalDeposit?.success)}</dd>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Pending</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">₹{fmt(data.totalDeposit?.pending)}</dd>
                  </div>
                </dl>
              </Link>
            </div>

            {/* Communication Stats */}
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {/* Call Requests */}
              <div className="group backdrop-blur-2xl backdrop-saturate-150 bg-white/50 dark:bg-white/[0.05] border border-white/30 dark:border-white/[0.08] rounded-2xl p-5 shadow-[0_6px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_10px_28px_rgba(0,0,0,0.4)] hover:scale-[1.01] hover:-translate-y-[2px] transition-all duration-400 ease-out relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 dark:from-blue-400/20 dark:to-blue-500/20 backdrop-blur-xl border border-white/20 dark:border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <Phone className="text-3xl text-blue-600 dark:text-blue-400" size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Call Requests</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Voice communication stats</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200/30 dark:border-white/10">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Total Requests</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{fmt(data.totalCallRequest)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200/30 dark:border-white/10">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Completed</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{fmt(data.totalCallCompleteRequest?.count)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Total Time</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{fmt(data.totalCallCompleteRequest?.time)} min</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Requests */}
              <div className="group backdrop-blur-2xl backdrop-saturate-150 bg-white/50 dark:bg-white/[0.05] border border-white/30 dark:border-white/[0.08] rounded-2xl p-5 shadow-[0_6px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_10px_28px_rgba(0,0,0,0.4)] hover:scale-[1.01] hover:-translate-y-[2px] transition-all duration-400 ease-out relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 dark:from-purple-400/20 dark:to-purple-500/20 backdrop-blur-xl border border-white/20 dark:border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <MessageCircle className="text-3xl text-purple-600 dark:text-purple-400" size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Chat Requests</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Text communication stats</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200/30 dark:border-white/10">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Total Requests</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{fmt(data.totalChatRequest)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200/30 dark:border-white/10">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Completed</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{fmt(data.totalChatComplteRequest?.count)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Total Time</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{fmt(data.totalChatComplteRequest?.time)} min</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expert Astro Match */}
              <div className="group backdrop-blur-2xl backdrop-saturate-150 bg-white/50 dark:bg-white/[0.05] border border-white/30 dark:border-white/[0.08] rounded-2xl p-5 shadow-[0_6px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_10px_28px_rgba(0,0,0,0.4)] hover:scale-[1.01] hover:-translate-y-[2px] transition-all duration-400 ease-out relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 dark:from-emerald-400/20 dark:to-emerald-500/20 backdrop-blur-xl border border-white/20 dark:border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <Brain className="text-3xl text-emerald-600 dark:text-emerald-400" size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Expert Match</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">AI-powered matching</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200/30 dark:border-white/10">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Total Requests</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{fmt(n(data.successRequests) + n(data.pendingRequests))}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200/30 dark:border-white/10">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Assigned</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{fmt(data.successRequests)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Pending</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{fmt(data.pendingRequests)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Today Section ===== */}
        <div className="space-y-6">
          <div className="backdrop-blur-2xl backdrop-saturate-150 bg-white/30 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-[0_6px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.3)]">
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Today&apos;s Performance
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-0.5">Real-time daily metrics and activities</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-5 auto-rows-[1fr]">
              {/* New Customers Today */}
              <Link
                href={hrefCustomersToday}
                className="block group relative h-full rounded-2xl border border-white/15 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] backdrop-blur-xl shadow-[0_6px_18px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.28)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_10px_26px_rgba(0,0,0,0.38)] hover:-translate-y-[2px] transition-all duration-300 overflow-hidden p-4 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                aria-label="Open Customers filtered for today"
              >
                {/* animated overlay */}
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute -top-14 -right-20 size-36 rounded-full bg-blue-500/12 blur-2xl animate-pulse" />
                  <div className="absolute -bottom-16 -left-16 size-28 rounded-full bg-indigo-500/10 blur-2xl animate-pulse delay-1000" />
                  <div className="absolute inset-y-0 -left-1 w-1/3 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-[120%] group-hover:translate-x-[220%] transition-transform duration-700 ease-out" />
                </div>

                <header className="relative flex items-center gap-2 mb-2">
                  <div className="size-8 rounded-lg border border-white/20 dark:border-white/10 bg-gradient-to-br from-blue-500/18 to-blue-600/18 flex items-center justify-center transform-gpu transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <UserPlus size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">New Customers</h3>
                </header>

                <div className="relative text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums mb-1.5">{fmt(data.todayCustomer)}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Joined today</p>
                </div>
              </Link>

              {/* Today Earnings */}
              <Link
                href={hrefWalletToday}
                className="block group relative h-full rounded-2xl border border-white/15 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] backdrop-blur-xl shadow-[0_6px_18px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.28)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_10px_26px_rgba(0,0,0,0.38)] hover:-translate-y-[2px] transition-all duration-300 overflow-hidden p-4 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                aria-label="Open Wallet filtered for today"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute -top-14 -right-20 size-36 rounded-full bg-emerald-500/12 blur-2xl animate-pulse" />
                  <div className="absolute -bottom-16 -left-16 size-28 rounded-full bg-green-500/10 blur-2xl animate-pulse delay-1000" />
                  <div className="absolute inset-y-0 -left-1 w-1/3 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-[120%] group-hover:translate-x-[220%] transition-transform duration-700 ease-out" />
                </div>

                <header className="relative flex items-center gap-2 mb-2">
                  <div className="size-8 rounded-lg border border-white/20 dark:border-white/10 bg-gradient-to-br from-emerald-500/18 to-emerald-600/18 flex items-center justify-center transform-gpu transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Today Earnings</h3>
                </header>

                <dl className="mt-1 divide-y divide-white/10 dark:divide-white/5 text-[13px] leading-tight font-medium">
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Today</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">₹{fmt((data.todayEarning as any)?.toFixed?.(2) ?? data.todayEarning)}</dd>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Astro</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">₹{fmt((data.todayAstroEarning as any)?.toFixed?.(2) ?? data.todayAstroEarning)}</dd>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Withdraw</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">₹{fmt(data.todayWithdraw)}</dd>
                  </div>
                </dl>
              </Link>

              {/* Today Calls (unchanged, not clickable) */}
              <section className="group relative h-full rounded-2xl border border-white/15 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] backdrop-blur-xl shadow-[0_6px_18px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.28)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_10px_26px_rgba(0,0,0,0.38)] hover:-translate-y-[2px] transition-all duration-300 overflow-hidden p-4">
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute -top-14 -right-20 size-36 rounded-full bg-cyan-500/12 blur-2xl animate-pulse" />
                  <div className="absolute -bottom-16 -left-16 size-28 rounded-full bg-sky-500/10 blur-2xl animate-pulse delay-1000" />
                  <div className="absolute inset-y-0 -left-1 w-1/3 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-[120%] group-hover:translate-x-[220%] transition-transform duration-700 ease-out" />
                </div>

                <header className="relative flex items-center gap-2 mb-2">
                  <div className="size-8 rounded-lg border border-white/20 dark:border-white/10 bg-gradient-to-br from-cyan-500/18 to-cyan-600/18 flex items-center justify-center transform-gpu transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Phone size={18} className="text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Call Activity</h3>
                </header>

                <dl className="mt-1 divide-y divide-white/10 dark:divide-white/5 text-[13px] leading-tight font-medium">
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Requests</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">{fmt(data.todayCallRequest)}</dd>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Time</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">{fmt(data.todayCallRequestTime)}&nbsp;min</dd>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Rejected</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">{fmt(data.todayCallRequestReject)}</dd>
                  </div>
                </dl>
              </section>

              {/* Today Chats (unchanged, not clickable) */}
              <section className="group relative h-full rounded-2xl border border-white/15 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] backdrop-blur-xl shadow-[0_6px_18px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.28)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_10px_26px_rgba(0,0,0,0.38)] hover:-translate-y-[2px] transition-all duration-300 overflow-hidden p-4">
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute -top-14 -right-20 size-36 rounded-full bg-indigo-500/12 blur-2xl animate-pulse" />
                  <div className="absolute -bottom-16 -left-16 size-28 rounded-full bg-violet-500/10 blur-2xl animate-pulse delay-1000" />
                  <div className="absolute inset-y-0 -left-1 w-1/3 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-[120%] group-hover:translate-x-[220%] transition-transform duration-700 ease-out" />
                </div>

                <header className="relative flex items-center gap-2 mb-2">
                  <div className="size-8 rounded-lg border border-white/20 dark:border-white/10 bg-gradient-to-br from-indigo-500/18 to-indigo-600/18 flex items-center justify-center transform-gpu transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <MessageCircle size={18} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Chat Activity</h3>
                </header>

                <dl className="mt-1 divide-y divide-white/10 dark:divide-white/5 text-[13px] leading-tight font-medium">
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Requests</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">{fmt(data.todayChatRequest)}</dd>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Time</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">{fmt(data.todayChatRequestTime)}&nbsp;min</dd>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Rejected</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">{fmt(data.todayChatRequestReject)}</dd>
                  </div>
                </dl>
              </section>

              {/* Today Deposits */}
              <Link
                href={hrefPaymentsToday}
                className="block group relative h-full rounded-2xl border border-white/15 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] backdrop-blur-xl shadow-[0_6px_18px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.28)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_10px_26px_rgba(0,0,0,0.38)] hover:-translate-y-[2px] transition-all duration-300 overflow-hidden p-4 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                aria-label="Open Payments filtered for today"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute -top-14 -right-20 size-36 rounded-full bg-amber-500/12 blur-2xl animate-pulse" />
                  <div className="absolute -bottom-16 -left-16 size-28 rounded-full bg-orange-500/10 blur-2xl animate-pulse delay-1000" />
                  <div className="absolute inset-y-0 -left-1 w-1/3 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-[120%] group-hover:translate-x-[220%] transition-transform duration-700 ease-out" />
                </div>

                <header className="relative flex items-center gap-2 mb-2">
                  <div className="size-8 rounded-lg border border-white/20 dark:border-white/10 bg-gradient-to-br from-amber-500/18 to-amber-600/18 flex items-center justify-center transform-gpu transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <CreditCard size={18} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Today Deposits</h3>
                </header>

                <dl className="mt-1 divide-y divide-white/10 dark:divide-white/5 text-[13px] leading-tight font-medium">
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Total</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">₹{fmt(n(data.todayDeposit?.success) + n(data.todayDeposit?.pending))}</dd>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Success</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">₹{fmt(data.todayDeposit?.success)}</dd>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-gray-600 dark:text-gray-400">Pending</dt>
                    <dd className="text-gray-900 dark:text-gray-100 tabular-nums">₹{fmt(data.todayDeposit?.pending)}</dd>
                  </div>
                </dl>
              </Link>
            </div>
          </div>


        </div>

        {/* ===== Charts Section ===== */}
        <div className="grid gap-5 xl:grid-cols-3">
          {/* Area Chart */}
          <div className="xl:col-span-2 group backdrop-blur-2xl backdrop-saturate-150 bg-white/50 dark:bg-white/[0.05] border border-white/30 dark:border-white/[0.08] rounded-2xl p-5 shadow-[0_6px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_10px_28px_rgba(0,0,0,0.4)] transition-all duration-400 ease-out relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Revenue Analytics</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">Comprehensive earnings overview and trends</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Earnings</span>
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-xl bg-white/30 dark:bg-white/[0.03] border border-white/20 dark:border-white/[0.05] rounded-xl p-3">
                <ChartClient options={areaOptions} series={areaSeries} type="area" height={260} />
              </div>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="group backdrop-blur-2xl backdrop-saturate-150 bg-white/50 dark:bg-white/[0.05] border border-white/30 dark:border-white/[0.08] rounded-2xl p-5 shadow-[0_6px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_10px_28px_rgba(0,0,0,0.4)] transition-all duration-400 ease-out relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
            <div className="relative">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Live Statistics</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">Real-time platform distribution</p>
              </div>
              <div className="backdrop-blur-xl bg-white/30 dark:bg-white/[0.03] border border-white/20 dark:border-white/[0.05] rounded-xl p-3 mb-4">
                <ChartClient options={donutOptions} series={donutSeries} type="donut" height={220} />
              </div>
              <div className="text-center">
                <div className="backdrop-blur-xl bg-white/40 dark:bg-white/[0.05] border border-white/20 dark:border-white/[0.08] rounded-xl p-4">
                  <p className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    ₹{fmt(totalExpense)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">This month expenses</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Bar Chart ===== */}
        <div className="group backdrop-blur-2xl backdrop-saturate-150 bg-white/50 dark:bg-white/[0.05] border border-white/30 dark:border-white/[0.08] rounded-2xl p-5 shadow-[0_6px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_10px_28px_rgba(0,0,0,0.4)] transition-all duration-400 ease-out relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Communication Analytics</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">Comparison of chat vs call interactions</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Chat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Call</span>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-xl bg-white/30 dark:bg-white/[0.03] border border-white/20 dark:border-white/[0.05] rounded-xl p-4">
              <ChartClient options={barOptions} series={barSeries} type="bar" height={260} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





