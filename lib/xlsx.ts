import { readFile } from 'fs/promises'
import * as XLSX from 'xlsx'
import path from 'path'
import prisma from '@/lib/db' // Your Prisma client
import fs from 'fs/promises'
import { sum } from 'lodash'

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
          [item.label, item.description, item.brand, item.packaging, item.units]
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

type InvoiceSum = {
  subtotal: number
  total: number
  refund: number
  vat: number
  discount: number
  exclTax: number
  stampTax: number
}

async function generateRecapExcelReport() {
  const currentYear = new Date().getFullYear()

  // Step 1: Fetch real data from DB (same as before)

  const invoices = await prisma.invoice.findMany({
    where: {
      createdAt: { gte: new Date(currentYear, 0, 1) }
    },
    select: {
      vatRate: true,
      subtotal: true,
      total: true,
      refund: true,
      vat: true,
      discount: true,
      stampTaxRate: true,
      stampTax: true
    }
  })

  const sums = invoices.reduce<InvoiceSum>(
    (
      acc,
      {
        subtotal,
        total,
        refund,
        vat,
        discount,
        vatRate,
        stampTax,
        stampTaxRate
      }
    ) => {
      acc.subtotal += subtotal ?? 0
      acc.total += total ?? 0
      acc.refund += refund ?? 0
      acc.vat += vat ?? 0
      acc.discount += discount ?? 0
      if (vatRate === 0) acc.exclTax += subtotal ?? 0
      if (stampTaxRate === 0) acc.stampTax += stampTax ?? 0
      return acc
    },
    {
      subtotal: 0,
      total: 0,
      refund: 0,
      vat: 0,
      discount: 0,
      exclTax: 0,
      stampTax: 0
    }
  )

  // const bruteCapital
  const capitaleBruteHorsTax: number = sums.subtotal
  const capitalExonerer: number = sums.exclTax
  const netCapitaleHorsTax: number = sums.subtotal - sums.exclTax
  const remise: number = sums.discount
  const netCommercial: number = netCapitaleHorsTax - sums.refund
  const retenueDeGuarantie = sums.refund
  const capitaleTaxable = netCommercial - retenueDeGuarantie
  const tva19 = capitaleTaxable * 0.19
  const timbre = sums.stampTax
  const totalTTC = capitaleTaxable + tva19 + timbre

  // Step 2: Load the template
  const templatePath = path.join(
    process.cwd(),
    'templates/RECAP CHIF AFFAIRE.xlsx'
  )

  const templateBuffer = await fs.readFile(templatePath)
  const workbook = XLSX.read(templateBuffer, {
    type: 'buffer',
    cellDates: true
  }) // cellDates: true to handle dates properly

  // Step 3: Get sheets and update cells
  const sheet1 = workbook.Sheets['Feuil1'] // Access by name
  const rowNumber = 8
  XLSX.utils.sheet_add_aoa(
    sheet1,
    [
      [capitaleBruteHorsTax],
      [capitalExonerer],
      [netCapitaleHorsTax],
      [remise],
      [netCommercial],
      [retenueDeGuarantie],
      [capitaleTaxable],
      [tva19],
      [timbre],
      [totalTTC]
    ],
    {
      origin: `B${rowNumber}`
    }
  )

  // Step 4: Generate buffer for the new file
  const newBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  // Return the buffer (same as before)
  return newBuffer
}

export { generateXlsx, type DataItem }
