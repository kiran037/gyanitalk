// "use client";

import React, { useState } from "react";
import { Button } from "@/components/adminUI/Button";
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
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  showIcon?: boolean;
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

  const ExcelIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      <path d="M10.5,11L12.5,14.5L10.5,18H12.5L13.75,16L15,18H17L15,14.5L17,11H15L13.75,13L12.5,11H10.5Z" />
    </svg>
  );

  const CheckIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" />
    </svg>
  );

  const ErrorIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 15h2v2h-2zm0-8h2v6h-2zm1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  );

  const buttonVariant = exportError ? "danger" : variant;
  const label = exportError
    ? "Error"
    : exportSuccess
    ? "Exported"
    : isExporting
    ? "Exporting..."
    : buttonText;

  const icon = exportError ? (
    <ErrorIcon />
  ) : exportSuccess ? (
    <CheckIcon />
  ) : showIcon ? (
    <ExcelIcon />
  ) : null;

  return (
    <Button
      onClick={handleClick}
      variant={buttonVariant}
      size={size}
      disabled={disabled || isExporting}
      loading={isExporting}
      icon={icon}
      className={className}
    >
      {label}
    </Button>
  );
}