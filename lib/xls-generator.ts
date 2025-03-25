import { readFile } from 'fs/promises'
import * as XLSX from 'xlsx'
import path from 'path'

interface DataItem {
  description: string
  label: string
  brand: string
  packaging: string
  units: string
}

async function generateXlsx(data: DataItem[]): Promise<XLSX.WorkBook> {
  try {
    // Get the absolute path to the template file
    const appDir = process.cwd()
    const templatePath = path.join(appDir, 'templates', 'gs1-soneras.xlsx')

    // Read the template file
    const templateBuffer: Buffer = await readFile(templatePath)
    const workbook: XLSX.WorkBook = XLSX.read(templateBuffer, {
      type: 'buffer'
    })

    // Get the first sheet
    const sheetName: string = workbook.SheetNames[0]
    const sheet: XLSX.WorkSheet = workbook.Sheets[sheetName]

    // Start from row 4 (index 3 in zero-based indexing)
    let rowIndex = 3

    for (const item of data) {
      // Update cells in columns B, C, D, E, F (1, 2, 3, 4, 5 in zero-based indexing)
      XLSX.utils.sheet_add_aoa(
        sheet,
        [
          [
            item.label,
            item.description,
            item.brand,
            item.packaging,
            item.units
          ]
        ],
        {
          origin: { r: rowIndex, c: 1 }
        }
      )

      rowIndex++
    }

    return workbook
  } catch (error) {
    console.error('Error generating XLSX file:', error)
    throw error // Re-throw the error for handling by the caller
  }
}

export { generateXlsx, type DataItem }
