
// components/ExportButton.tsx
"use client";

import React, { useState } from "react";
import { exportTableToExcel, exportJsonToExcel } from "@/utils/exportExcel";

interface ExportButtonProps {
  type: "table" | "json";
  tableId?: string;
  jsonData?: object[];
  /** NEW (optional): fetch rows lazily when jsonData is not provided */
  getJsonData?: () => Promise<object[]>;
  filename?: string;
  sheetName?: string;
  className?: string;
  buttonText?: string;
  variant?: "primary" | "secondary" | "outline" | "success";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  showIcon?: boolean;
  showTooltip?: boolean;
}

export default function ExportButton({
  type,
  tableId,
  jsonData,
  getJsonData,
  filename = "data.xlsx",
  sheetName = "Sheet1",
  className = "",
  buttonText = "Export to Excel",
  variant = "primary",
  size = "md",
  disabled = false,
  showIcon = true,
  showTooltip = true,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showTooltipState, setShowTooltipState] = useState(false);

  const handleClick = async () => {
    if (disabled || isExporting) return;

    setIsExporting(true);
    setExportError(null);

    try {
      if (type === "table") {
        if (!tableId) {
          throw new Error("tableId is required for table export");
        }
        await exportTableToExcel(tableId, filename);
      } else if (type === "json") {
        let rows: object[] | undefined = jsonData;

        // ⬇️ Lazy load if jsonData not provided or empty
        if ((!rows || rows.length === 0) && getJsonData) {
          rows = await getJsonData();
        }

        if (!rows || rows.length === 0) {
          throw new Error("jsonData is empty or undefined for json export");
        }
        await exportJsonToExcel(rows, filename, sheetName);
      }

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Export failed";
      setExportError(errorMessage);
      setTimeout(() => setExportError(null), 4000);
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Base styles
  const baseStyles =
    "relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group select-none";

  // Size variants
  const sizeStyles = {
    sm: "px-3 py-2 text-sm rounded-md gap-1.5 min-w-[80px]",
    md: "px-4 py-2.5 text-sm rounded-lg gap-2 min-w-[120px]",
    lg: "px-6 py-3 text-base rounded-lg gap-2.5 min-w-[140px]",
  };

  // Variant styles with enhanced dark mode support
  const variantStyles = {
    primary: `
      bg-blue-600 hover:bg-blue-700 active:bg-blue-800
      dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700
      text-white shadow-lg hover:shadow-xl
      focus:ring-blue-500 dark:focus:ring-blue-400
      focus:ring-offset-white dark:focus:ring-offset-gray-900
      border border-blue-600 dark:border-blue-500
    `,
    secondary: `
      bg-gray-100 hover:bg-gray-200 active:bg-gray-300
      dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-500
      text-gray-900 dark:text-gray-100 shadow-md hover:shadow-lg
      focus:ring-gray-500 dark:focus:ring-gray-400
      focus:ring-offset-white dark:focus:ring-offset-gray-900
      border border-gray-200 dark:border-gray-600
    `,
    outline: `
      border-2 border-blue-600 dark:border-blue-500
      bg-transparent hover:bg-blue-50 active:bg-blue-100
      dark:hover:bg-blue-900/20 dark:active:bg-blue-900/40
      text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300
      focus:ring-blue-500 dark:focus:ring-blue-400
      focus:ring-offset-white dark:focus:ring-offset-gray-900
      shadow-sm hover:shadow-md
    `,
    success: `
      bg-green-600 hover:bg-green-700 active:bg-green-800
      dark:bg-green-500 dark:hover:bg-green-600 dark:active:bg-green-700
      text-white shadow-lg hover:shadow-xl
      focus:ring-green-500 dark:focus:ring-green-400
      focus:ring-offset-white dark:focus:ring-offset-gray-900
      border border-green-600 dark:border-green-500
    `,
  };

  // Error state override
  const errorStyles = `
    bg-red-600 hover:bg-red-700 active:bg-red-800
    dark:bg-red-500 dark:hover:bg-red-600 dark:active:bg-red-700
    text-white shadow-lg
    focus:ring-red-500 dark:focus:ring-red-400
    focus:ring-offset-white dark:focus:ring-offset-gray-900
    border border-red-600 dark:border-red-500
  `;

  const currentVariant = exportError ? errorStyles : variantStyles[variant];
  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${currentVariant} ${className}`.trim();

  // Icons
  const ExcelIcon = ({ className: iconClassName = "" }) => (
    <svg
      className={`${size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5"} ${iconClassName}`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      <path d="M10.5,11L12.5,14.5L10.5,18H12.5L13.75,16L15,18H17L15,14.5L17,11H15L13.75,13L12.5,11H10.5Z" />
    </svg>
  );

  const CheckIcon = () => (
    <svg className={`${size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5"}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" />
    </svg>
  );

  const ErrorIcon = () => (
    <svg className={`${size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5"}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
    </svg>
  );

  const SpinnerIcon = () => (
    <svg className={`${size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5"} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <path
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        strokeOpacity="0.75"
      />
    </svg>
  );

  const getButtonContent = () => {
    if (exportError) {
      return (
        <>
          {showIcon && <ErrorIcon />}
          <span className="truncate">Error!</span>
        </>
      );
    }

    if (exportSuccess) {
      return (
        <>
          {showIcon && <CheckIcon />}
          <span className="truncate">Exported!</span>
        </>
      );
    }

    if (isExporting) {
      return (
        <>
          {showIcon && <SpinnerIcon />}
          <span className="truncate">Exporting...</span>
        </>
      );
    }

    return (
      <>
        {showIcon && <ExcelIcon className={isExporting ? "animate-pulse" : ""} />}
        <span className="truncate">{buttonText}</span>
      </>
    );
  };

  const getTooltipText = () => {
    if (exportError) return exportError;
    if (exportSuccess) return `Successfully exported ${filename}`;
    if (isExporting) return `Exporting ${type} data...`;
    return `Export ${type} data to Excel (${filename})`;
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        className={combinedClassName}
        disabled={disabled || isExporting}
        type="button"
        aria-label={getTooltipText()}
        onMouseEnter={() => setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
        onFocus={() => setShowTooltipState(true)}
        onBlur={() => setShowTooltipState(false)}
      >
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

        {/* Ripple effect on click */}
        <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-active:opacity-100 group-active:animate-ping transition-opacity duration-150" />

        {/* Button content */}
        <div className="relative z-10 flex items-center justify-center">{getButtonContent()}</div>
      </button>

      {/* Tooltip */}
      {showTooltip && showTooltipState && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md px-3 py-2 whitespace-nowrap shadow-lg border border-gray-700 dark:border-gray-600">
            {getTooltipText()}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
          </div>
        </div>
      )}
    </div>
  );
}
