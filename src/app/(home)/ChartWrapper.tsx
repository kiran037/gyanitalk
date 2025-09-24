// "use client";

// import dynamic from "next/dynamic";

// // Load ApexCharts only on the client
// const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// interface ChartWrapperProps {
//   options: any;
//   series: any;
//   type: "line" | "bar" | "area" | "donut";
//   height?: number;
// }

// export default function ChartWrapper({ options, series, type, height = 300 }: ChartWrapperProps) {
//   return <Chart options={options} series={series} type={type} height={height} />;
// }

"use client";

import dynamic from "next/dynamic";

// Load ApexCharts only on the client
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ChartWrapperProps {
  options: any;
  series: any;
  type: "line" | "bar" | "area" | "donut";
  height?: number;
}

export default function ChartWrapper({ options, series, type, height = 300 }: ChartWrapperProps) {
  // Extend options inside the client component to include formatter safely
  const updatedOptions = {
    ...options,
    yaxis: {
      ...(options.yaxis ?? {}),
      decimalsInFloat: 2,
      labels: {
        ...(options.yaxis?.labels ?? {}),
        formatter: (value: number) => value.toFixed(2),
      },
    },
  };

  return <Chart options={updatedOptions} series={series} type={type} height={height} />;
}
