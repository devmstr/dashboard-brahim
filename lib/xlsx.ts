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
  options?: Partial<{
    border: Partial<ExcelJS.Borders>
    fill: ExcelJS.Fill
    font: Partial<ExcelJS.Font>
    alignment: Partial<ExcelJS.Alignment>
    numFmt: string
  }>
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

    // 🎨 Dynamically apply all provided style options
    if (options) {
      if (options.border) cell.border = options.border
      if (options.fill) cell.fill = options.fill
      if (options.font) cell.font = options.font
      if (options.alignment) cell.alignment = options.alignment
      if (options.numFmt) cell.numFmt = options.numFmt
    }
  }

  rowsMap.forEach((r) => r.commit())
}
