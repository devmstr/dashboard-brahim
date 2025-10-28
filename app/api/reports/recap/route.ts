import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import ExcelJS from 'exceljs'
import path from 'path'
import fs from 'fs/promises'
import { Prisma } from '@prisma/client'

type InvoiceSum = {
  subtotal: number
  total: number
  refund: number
  vat: number
  discount: number
  exclTax: number
  stampTax: number
}

const parseDateStart = (str: string | null): Date | null => {
  if (!str || str.trim() === '') return null
  const date = new Date(str)
  if (isNaN(date.getTime())) return null

  // Set to 00:00:00.000 of that day
  date.setHours(0, 0, 0, 0)
  return date
}

const parseDateEnd = (str: string | null): Date | null => {
  if (!str || str.trim() === '') return null
  const date = new Date(str)
  if (isNaN(date.getTime())) return null

  // Set to 23:59:59.999 of that day
  date.setHours(23, 59, 59, 999)
  return date
}

/**
 * Edit specific cells in a worksheet.
 *
 * @param sheet      The ExcelJS worksheet
 * @param edits      Array of { row, col, value }
 *                   • row = Excel row number (1‑based)
 *                   • col = Excel column number (1 = A, 2 = B, …)
 *                   • value = number | string | null | Date | …
 */
function editCells(
  sheet: ExcelJS.Worksheet,
  edits: { row: number; col: number; value: any }[]
) {
  // Group edits by row to avoid fetching the same Row object many times
  const rowsMap = new Map<number, ExcelJS.Row>()

  for (const { row, col, value } of edits) {
    let excelRow = rowsMap.get(row)
    if (!excelRow) {
      excelRow = sheet.getRow(row)
      rowsMap.set(row, excelRow)
    }

    const cell = excelRow.getCell(col)
    cell.value = value
  }

  // Commit every row that was touched
  rowsMap.forEach((r) => r.commit())
}
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.nextUrl)

  const currentYear = new Date().getFullYear()
  const fromStr = searchParams.get('from')
  const toStr = searchParams.get('to')
  const from = parseDateStart(fromStr)
  const to = parseDateEnd(toStr)

  const where: Prisma.InvoiceWhereInput = {
    createdAt: {
      gte: new Date(currentYear, 0, 1)
    }
  }

  if (from && to) where.createdAt = { gte: from, lte: to }

  // Fetch invoices for the current year
  const invoices = await prisma.invoice.findMany({
    where,
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
    (acc, inv) => ({
      subtotal: acc.subtotal + (inv.subtotal ?? 0),
      total: acc.total + (inv.total ?? 0),
      refund: acc.refund + (inv.refund ?? 0),
      vat: acc.vat + (inv.vat ?? 0),
      discount: acc.discount + (inv.discount ?? 0),
      exclTax: acc.exclTax + (inv.vatRate === 0 ? inv.subtotal ?? 0 : 0),
      stampTax: acc.stampTax + (inv.stampTaxRate === 0 ? inv.stampTax ?? 0 : 0)
    }),
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

  const { subtotal, exclTax, discount, refund, stampTax } = sums

  // Compute recap summary
  const capitaleBruteHorsTax = subtotal
  const capitalExonerer = exclTax
  const netCapitaleHorsTax = subtotal - exclTax
  const remise = discount
  const netCommercial = netCapitaleHorsTax - refund
  const retenueDeGuarantie = refund
  const capitaleTaxable = netCommercial - retenueDeGuarantie
  const tva19 = capitaleTaxable * 0.19
  const timbre = stampTax
  const totalTTC = capitaleTaxable + tva19 + timbre

  // Load Excel template
  const templatePath = path.join(
    process.cwd(),
    'templates/RECAP CHIF AFFAIRE.xlsx'
  )

  const file = await fs.readFile(templatePath)

  const workbook = new ExcelJS.Workbook()

  await workbook.xlsx.load(file as any)

  // Write computed data
  const sheet = workbook.getWorksheet('Feuil1') as ExcelJS.Worksheet

  editCells(sheet, [
    // ---- Row 8 (B → K) -------------------------------------------------
    { row: 8, col: 2, value: capitaleBruteHorsTax },
    { row: 8, col: 3, value: capitalExonerer },
    { row: 8, col: 4, value: netCapitaleHorsTax },
    { row: 8, col: 5, value: remise },
    { row: 8, col: 6, value: netCommercial },
    { row: 8, col: 7, value: retenueDeGuarantie },
    { row: 8, col: 8, value: capitaleTaxable },
    { row: 8, col: 9, value: tva19 },
    { row: 8, col: 10, value: timbre },
    { row: 8, col: 11, value: totalTTC },

    // ---- Row 23 (B → E) ------------------------------------------------
    { row: 23, col: 2, value: capitaleTaxable },
    { row: 23, col: 3, value: 0 },
    { row: 23, col: 4, value: capitaleTaxable },
    { row: 23, col: 5, value: tva19 }
  ])

  const newBuffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(newBuffer, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="recap_${currentYear}.xlsx"`
    }
  })
}
