"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
    }[];
  };
  title?: string;
  height?: number;
  horizontal?: boolean;

  // new styling props
  titleColor?: string;
  textColor?: string;
  gridColor?: string;
  tooltipBgColor?: string;
  tooltipTitleColor?: string;
  tooltipBodyColor?: string;
  tooltipBorderColor?: string;
}

export function BarChart({
  data,
  title,
  height = 300,
  horizontal = false,
  titleColor = "rgb(17, 24, 39)",
  textColor = "rgb(75, 85, 99)",
  gridColor = "rgba(209, 213, 219, 0.6)",
  tooltipBgColor = "rgba(0, 0, 0, 0.8)",
  tooltipTitleColor = "rgb(243, 244, 246)",
  tooltipBodyColor = "rgb(209, 213, 219)",
  tooltipBorderColor = "rgba(255, 107, 53, 0.5)",
}: BarChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? ("y" as const) : ("x" as const),
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
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
      },
    },
    scales: {
      x: {
        grid: {
          color: gridColor,
          drawBorder: false,
        },
        ticks: {
          color: textColor,
        },
      },
      y: {
        grid: {
          color: gridColor,
          drawBorder: false,
        },
        ticks: {
          color: textColor,
        },
      },
    },
  };

  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor:
        dataset.backgroundColor ||
        `rgba(255, ${107 + index * 50}, ${53 + index * 30}, 0.8)`,
      borderRadius: 8,
      borderSkipped: false,
    })),
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <div style={{ height: `${height}px` }}>
        <Bar options={options} data={chartData} />
      </div>
    </div>
  );
}