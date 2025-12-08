"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: {
    labels: string[];
    data: number[];
  };
  title?: string;
  height?: number;

  // new styling props
  titleColor?: string;
  textColor?: string;
  tooltipBgColor?: string;
  tooltipTitleColor?: string;
  tooltipBodyColor?: string;
  tooltipBorderColor?: string;
}

export function PieChart({
  data,
  title,
  height = 300,
  titleColor = "rgb(17, 24, 39)",
  textColor = "rgb(75, 85, 99)",
  tooltipBgColor = "rgba(0, 0, 0, 0.8)",
  tooltipTitleColor = "rgb(243, 244, 246)",
  tooltipBodyColor = "rgb(209, 213, 219)",
  tooltipBorderColor = "rgba(255, 107, 53, 0.5)",
}: PieChartProps) {
  const colors = [
    "rgba(255, 107, 53, 0.8)",
    "rgba(255, 179, 71, 0.8)",
    "rgba(59, 130, 246, 0.8)",
    "rgba(16, 185, 129, 0.8)",
    "rgba(139, 92, 246, 0.8)",
    "rgba(236, 72, 153, 0.8)",
  ];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right" as const,
        labels: {
          color: textColor,
          usePointStyle: true,
          padding: 15,
        },
      },
      title: {
        display: !!title,
        text: title,
        color: titleColor,
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
      tooltip: {
        backgroundColor: tooltipBgColor,
        titleColor: tooltipTitleColor,
        bodyColor: tooltipBodyColor,
        borderColor: tooltipBorderColor,
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.data,
        backgroundColor: colors.slice(0, data.labels.length),
        borderWidth: 2,
        borderColor: "#1f2937",
      },
    ],
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <div style={{ height: `${height}px` }}>
        <Doughnut options={options} data={chartData} />
      </div>
    </div>
  );
}