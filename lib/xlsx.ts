import ExcelJS from 'exceljs'
/**
 * Edit specific cells in a worksheet.
 *
 * @param sheet      The ExcelJS worksheet
 * @param edits      Array of { row, col, value }
 *                   • row = Excel row number (1‑based)
 *                   • col = Excel column number (1 = A, 2 = B, …)
 *                   • value = number | string | null | Date | …
 */
export function editCells(
  sheet: ExcelJS.Worksheet,
  edits: { row: number; col: number; value: any }[],
  options?: { withBorder?: boolean } // 👈 optional flag
) {
  const rowsMap = new Map<number, ExcelJS.Row>()

  for (const { row, col, value } of edits) {
    let excelRow = rowsMap.get(row)
    if (!excelRow) {
      excelRow = sheet.getRow(row)
      rowsMap.set(row, excelRow)
    }

    const cell = excelRow.getCell(col)
    cell.value = value

    // 🟩 Apply border only if requested
    if (options?.withBorder) {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    }
  }

  rowsMap.forEach((r) => r.commit())
}
