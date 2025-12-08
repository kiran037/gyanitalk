"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
    }[];
  };
  title?: string;
  height?: number;

  // 👇 new optional styling props
  titleColor?: string;
  textColor?: string;
  gridColor?: string;
  tooltipBgColor?: string;
  tooltipTitleColor?: string;
  tooltipBodyColor?: string;
  tooltipBorderColor?: string;
}

export function LineChart({
  data,
  title,
  height = 300,
  titleColor = "rgb(17, 24, 39)", // default: gray-900
  textColor = "rgb(75, 85, 99)", // default: gray-600
  gridColor = "rgba(209, 213, 219, 0.6)", // default: gray-300
  tooltipBgColor = "rgba(0, 0, 0, 0.8)",
  tooltipTitleColor = "rgb(243, 244, 246)",
  tooltipBodyColor = "rgb(209, 213, 219)",
  tooltipBorderColor = "rgba(255, 107, 53, 0.5)",
}: LineChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
        mode: "index" as const,
        intersect: false,
        backgroundColor: tooltipBgColor,
        titleColor: tooltipTitleColor,
        bodyColor: tooltipBodyColor,
        borderColor: tooltipBorderColor,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
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
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      borderColor:
        dataset.borderColor ||
        `rgba(255, ${107 + index * 50}, ${53 + index * 30}, 1)`,
      backgroundColor:
        dataset.backgroundColor ||
        `rgba(255, ${107 + index * 50}, ${53 + index * 30}, 0.1)`,
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: "#ffffff",
      pointBorderWidth: 2,
    })),
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <div style={{ height: `${height}px` }}>
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
}