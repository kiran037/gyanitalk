import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * Exports an HTML table to an Excel (.xlsx) file download.
 *
 * @param tableId - The HTML id attribute of the table to export.
 * @param filename - The filename for the downloaded Excel file.
 */
export async function exportTableToExcel(tableId: string, filename = "data.xlsx") {
  const table = document.getElementById(tableId);
  if (!table) {
    console.error(`Table with id '${tableId}' not found`);
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  // Get all rows from the table
  const rows = table.querySelectorAll("tr");

  rows.forEach((row, rowIndex) => {
    const cells = row.querySelectorAll("th, td");
    
    cells.forEach((cell, colIndex) => {
      // ExcelJS uses 1-based indexing for rows and columns
      const excelCell = worksheet.getCell(rowIndex + 1, colIndex + 1);
      
      // Set the value (using innerText to get visible text)
      excelCell.value = (cell as HTMLElement).innerText;

      // Optional: Add basic styling for headers (assuming <th> tags are headers)
      if (cell.tagName.toLowerCase() === "th") {
        excelCell.font = { bold: true };
      }
    });
  });

  // Generate buffer and save
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, filename);
}

/**
 * Exports a JSON array to an Excel (.xlsx) file download.
 *
 * @param data - Array of objects to export.
 * @param filename - The filename for the downloaded Excel file.
 * @param sheetName - Optional sheet name inside Excel workbook.
 */
export async function exportJsonToExcel(
  data: any[],
  filename = "data.xlsx",
  sheetName = "Sheet1"
) {
  if (!data || !data.length) {
    console.warn("No data to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Extract headers from the first object keys
  const headers = Object.keys(data[0]);
  
  // Set columns in ExcelJS
  worksheet.columns = headers.map((header) => ({
    header: header,
    key: header,
    width: 20, // Default width
  }));

  // Make header row bold
  worksheet.getRow(1).font = { bold: true };

  // Add rows
  worksheet.addRows(data);

  // Generate buffer and save
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, filename);
}