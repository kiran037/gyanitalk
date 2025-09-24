

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Exports an HTML table to an Excel (.xlsx) file download.
 * 
 * @param tableId - The HTML id attribute of the table to export.
 * @param filename - The filename for the downloaded Excel file including .xlsx extension.
 */
export function exportTableToExcel(tableId: string, filename = "data.xlsx") {
  const table = document.getElementById(tableId);
  if (!table) {
    console.error(`Table with id '${tableId}' not found`);
    return;
  }

  // Convert HTML table element to worksheet
  const worksheet = XLSX.utils.table_to_sheet(table);

  // Create a new workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Write workbook to binary array
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  // Create a blob from the output and trigger file download
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  saveAs(blob, filename);
}

/**
 * Exports a JSON array to an Excel (.xlsx) file download.
 * 
 * @param data - Array of objects to export.
 * @param filename - The filename for the downloaded Excel file including .xlsx extension.
 * @param sheetName - Optional sheet name inside Excel workbook.
 */
export function exportJsonToExcel(
  data: object[],
  filename = "data.xlsx",
  sheetName = "Sheet1"
) {
  if (!data || !data.length) {
    console.warn("No data to export");
    return;
  }

  // Convert JSON data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Create a new workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Write workbook to binary array
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  // Create a blob from the output and trigger file download
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  saveAs(blob, filename);
}
