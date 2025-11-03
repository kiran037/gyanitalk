// components/ExportButton.tsx
"use client";

import React, { useState } from "react";
import GlassButton from "@/components/GlassUI/GlassButton";
import { cx } from "@/components/GlassUI/GlassKit";
import { exportTableToExcel, exportJsonToExcel } from "@/utils/exportExcel";

interface ExportButtonProps {
  type: "table" | "json";
  tableId?: string;
  jsonData?: object[];
  getJsonData?: () => Promise<object[]>;
  filename?: string;
  sheetName?: string;
  className?: string;
  buttonText?: string;
  /** Match GlassButton variants */
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "success";
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

  async function handleClick() {
    if (disabled || isExporting) return;
    setIsExporting(true);
    setExportError(null);

    try {
      if (type === "table") {
        if (!tableId) throw new Error("tableId is required for table export");
        await exportTableToExcel(tableId, filename);
      } else {
        let rows = jsonData;
        if ((!rows || rows.length === 0) && getJsonData) rows = await getJsonData();
        if (!rows || rows.length === 0) throw new Error("No data to export");
        await exportJsonToExcel(rows, filename, sheetName);
      }
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch (e: any) {
      setExportError(e?.message || "Export failed");
      setTimeout(() => setExportError(null), 3500);
    } finally {
      setIsExporting(false);
    }
  }

  // Map your extra variants to GlassButton’s palette
  const mappedVariant: "primary" | "secondary" | "ghost" | "danger" =
    exportError
      ? "danger"
      : variant === "outline"
      ? "secondary"
      : variant === "success"
      ? "primary"
      : (variant as any);

  // Size tweaks to align with your other buttons
  const sizeClass =
    size === "sm"
      ? "px-3 py-2 text-sm rounded-lg"
      : size === "lg"
      ? "px-5 py-3 text-base rounded-xl"
      : "px-4 py-2 text-sm"; // md default (matches GlassButton)

  // Minimal icons (same size as GlassButton icon)
  const ExcelIcon = () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      <path d="M10.5,11L12.5,14.5L10.5,18H12.5L13.75,16L15,18H17L15,14.5L17,11H15L13.75,13L12.5,11H10.5Z" />
    </svg>
  );
  const CheckIcon = () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" />
    </svg>
  );
  const ErrorIcon = () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 15h2v2h-2zm0-8h2v6h-2zm1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  );
  const SpinnerIcon = () => (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="2" />
    </svg>
  );

  // Label + icon based on state
  const label = exportError
    ? "Error"
    : exportSuccess
    ? "Exported"
    : isExporting
    ? "Exporting…"
    : buttonText;

  const Icon =
    exportError ? ErrorIcon : exportSuccess ? CheckIcon : isExporting ? SpinnerIcon : showIcon ? ExcelIcon : null;

  return (
    <GlassButton
      onClick={handleClick}
      variant={mappedVariant}
      disabled={disabled || isExporting}
      className={cx(sizeClass, className)}
      // simple native tooltip only (no fancy popovers)
      // keep it consistent with other buttons
      // eslint-disable-next-line react/forbid-dom-props
      {...(showTooltip ? { title: exportError ? exportError : `Export ${type} → ${filename}` } : {})}
    >
      {Icon ? <Icon /> : null}
      <span className="truncate">{label}</span>
    </GlassButton>
  );
}
