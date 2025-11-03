// src/app/(home)/ChartWrapper.tsx
"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import type { ApexOptions } from "apexcharts"; // keep this if available

// --- Local fallbacks for series types (some apexcharts versions don't export these) ---
type ApexAxisChartSeries =
  | { name?: string; data: Array<number | { x: any; y: number } | { x: any; y: number; fillColor?: string }> }[]
  | number[][]; // very permissive, covers most usages

type ApexNonAxisChartSeries = number[]; // e.g., donut/pie expects a simple numeric array

// Load ApexCharts only on the client
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// ---- Types ---------------------------------------------------------------

type AxisChartType = "line" | "bar" | "area";
type NonAxisChartType = "donut";

type AxisChartProps = {
  type: AxisChartType;
  series: ApexAxisChartSeries;
  options?: ApexOptions;
  height?: number;
  className?: string;
};

type NonAxisChartProps = {
  type: NonAxisChartType;
  series: ApexNonAxisChartSeries;
  options?: ApexOptions;
  height?: number;
  className?: string;
};

type ChartWrapperProps = AxisChartProps | NonAxisChartProps;

// ---- Helpers -------------------------------------------------------------

const numberFmt = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});

function withYAxisFormatter(opts?: ApexOptions): ApexOptions {
  // Support both object and array yaxis configs; apply formatter to first axis when array
  const base = opts ?? {};
  const current = base.yaxis;

  const ensureFormatter = (y: NonNullable<ApexOptions["yaxis"]>) => {
    // When y is an object
    if (!Array.isArray(y)) {
      const existing = y?.labels?.formatter;
      const formatter =
        typeof existing === "function"
          ? existing
          : (val: number) => {
              const n = Number(val);
              return Number.isFinite(n) ? numberFmt.format(n) : String(val);
            };
      return {
        ...y,
        decimalsInFloat: 2,
        labels: { ...(y?.labels ?? {}), formatter },
      };
    }

    // When y is an array
    const [first, ...rest] = y;
    const existing = first?.labels?.formatter;
    const formatter =
      typeof existing === "function"
        ? existing
        : (val: number) => {
            const n = Number(val);
            return Number.isFinite(n) ? numberFmt.format(n) : String(val);
          };

    const patchedFirst = {
      ...first,
      decimalsInFloat: 2,
      labels: { ...(first?.labels ?? {}), formatter },
    };

    return [patchedFirst, ...rest];
  };

  return {
    ...base,
    yaxis: current ? ensureFormatter(current) : { decimalsInFloat: 2, labels: { formatter: (v: number) => numberFmt.format(Number(v)) } },
  };
}

// ---- Component -----------------------------------------------------------

export default function ChartWrapper(props: ChartWrapperProps) {
  const { type, height = 300, className } = props;

  // Memoize options to avoid re-computing on every render
  const options = React.useMemo<ApexOptions>(() => {
    if (type === "line" || type === "bar" || type === "area") {
      return withYAxisFormatter(props.options);
    }
    return props.options ?? {};
  }, [type, props.options]);

  // Series memo for stability
  const series = React.useMemo(() => props.series as any, [props.series]);

  return (
    <div className={className}>
      <ReactApexChart type={type as any} options={options} series={series} height={height} />
    </div>
  );
}
