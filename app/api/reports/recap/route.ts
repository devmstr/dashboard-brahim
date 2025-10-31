// app/api/reports/journal/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { format } from 'date-fns'
import { Prisma } from '@prisma/client'
import { formatPrice } from '@/lib/utils'
import ExcelJS from 'exceljs'
import { editCells } from '@/lib/xlsx'
import path from 'path'
import fs from 'fs/promises'
import { getCurrentUser } from '@/lib/session'

/* --------------------------------------------------------------
   Helper – same date parsing you already use in the recap route
   -------------------------------------------------------------- */
const parseDateStart = (s: string | null): Date | null => {
  if (!s?.trim()) return null
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return null
  d.setHours(0, 0, 0, 0)
  return d
}
const parseDateEnd = (s: string | null): Date | null => {
  if (!s?.trim()) return null
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return null
  d.setHours(23, 59, 59, 999)
  return d
}

type TableRowType = [
  string, //  SECTEURS
  string, //  C.A BRUTE H/T
  string, //  C.A EXONERE
  string, //  C.A NET H/T
  string, //  REMISE
  string, //  NET VENTES
  string, //  R.G
  string, //  C.A TAXABLE
  string, //  TVA
  string, //  Timbre
  string //  TTC
]

/* --------------------------------------------------------------
   GET – generate CSV or JSON
   -------------------------------------------------------------- */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const user = await getCurrentUser()
  const userName = user ? user.username : 'GUEST'
  const SOFTWARE_VERSION = '1.2.9'

  // ---------- 1. Build Prisma WHERE clause ----------
  const from = parseDateStart(searchParams.get('from'))
  const to = parseDateEnd(searchParams.get('to'))

  const where: Prisma.InvoiceWhereInput = {
    type: 'FINAL'
  }

  const currentYear = new Date().getFullYear()
  where.createdAt = { gte: new Date(currentYear, 0, 1) }

  if (from && to) {
    where.createdAt = { gte: from, lte: to }
  }

  // ---------- 2. Fetch the rows ----------
  const invoices = await prisma.invoice.findMany({
    where,
    select: {
      reference: true,
      total: true,
      subtotal: true,
      refund: true,
      discount: true,
      vat: true,
      vatRate: true,
      stampTax: true,
      createdAt: true
    },
    orderBy: { reference: 'asc' }
  })

  // ---------- 3. Handle JSON ----------
  const formatParam = searchParams.get('format')
  if (formatParam === 'json') {
    return NextResponse.json(invoices)
  }

  // ---------- 4. Handle Excel  ----------

  // Load Excel template
  const templatePath = path.join(
    process.cwd(),
    'templates/recapitulatif_du_chiffre_d_affaires.xlsx'
  )

  const file = await fs.readFile(templatePath)

  const workbook = new ExcelJS.Workbook()

  await workbook.xlsx.load(file as any)

  // Write computed data
  const sheet = workbook.getWorksheet(1) as ExcelJS.Worksheet

  const { bruteHT, taxEcluded, refund, discount, stampTax, total, vat } =
    invoices.reduce(
      (acc, inv) => {
        const subtotal = Number(inv.subtotal)
        const discount = Number(inv.discount)
        const refund = Number(inv.refund)
        const stampTax = Number(inv.stampTax)
        const vat = Number(inv.vat)
        const total = Number(inv.total)

        const bruteHT = subtotal + discount + refund
        const taxEcluded = inv.vatRate === 0 ? bruteHT : 0

        acc.bruteHT += bruteHT
        acc.taxEcluded += taxEcluded
        acc.discount += discount
        acc.refund += refund
        acc.stampTax += stampTax
        acc.vat += vat
        acc.total += total

        return acc
      },
      {
        bruteHT: 0,
        taxEcluded: 0,
        discount: 0,
        refund: 0,
        stampTax: 0,
        vat: 0,
        total: 0
      }
    )

  const netHT = bruteHT - taxEcluded
  const netSales = netHT - discount
  const taxable = netSales - refund

  // 1. Edit the name metadata
  editCells(sheet, [
    {
      row: 8,
      col: 4,
      value: userName
    },
    {
      row: 9,
      col: 4,
      value: format(new Date(), 'dd/MM/yyyy')
    },
    {
      row: 10,
      col: 4,
      value: `${format(
        searchParams.get('from')?.toString()!,
        'dd/MM/yyyy'
      )} - ${format(searchParams.get('to')?.toString()!, 'dd/MM/yyyy')}`
    },
    {
      row: 11,
      col: 4,
      value: 'Sonerasflow 1.1.9'
    }
  ])
  // 1.2 Edit Header (totals)
  editCells(sheet, [
    { row: 9, col: 6, value: formatPrice(taxable) },
    { row: 9, col: 8, value: formatPrice(taxable * 0.19) },
    { row: 9, col: 10, value: formatPrice(stampTax) },
    { row: 11, col: 12, value: formatPrice(taxable * 1.19) }
  ])
  // 2. Edit Table
  editCells(
    sheet,
    [
      { row: 14, col: 2, value: 'RAD/FAIS' },
      { row: 14, col: 3, value: formatPrice(bruteHT) },
      { row: 14, col: 4, value: formatPrice(taxEcluded) },
      { row: 14, col: 5, value: formatPrice(netHT) },
      { row: 14, col: 6, value: formatPrice(discount) },
      { row: 14, col: 7, value: formatPrice(netSales) },
      { row: 14, col: 8, value: formatPrice(refund) },
      { row: 14, col: 9, value: formatPrice(taxable) },
      { row: 14, col: 10, value: formatPrice(taxable * 0.19) },
      { row: 14, col: 11, value: formatPrice(stampTax) },
      { row: 14, col: 12, value: formatPrice(taxable * 1.19) }
    ],
    {
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    }
  )
  editCells(
    sheet,
    [
      { row: 15, col: 2, value: 'DECHETS' },
      { row: 15, col: 3, value: '-' },
      { row: 15, col: 4, value: '-' },
      { row: 15, col: 5, value: '-' },
      { row: 15, col: 6, value: '-' },
      { row: 15, col: 7, value: '-' },
      { row: 15, col: 8, value: '-' },
      { row: 15, col: 9, value: '-' },
      { row: 15, col: 10, value: '-' },
      { row: 15, col: 11, value: '-' },
      { row: 15, col: 12, value: '-' }
    ],
    {
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    }
  )
  editCells(
    sheet,
    [
      { row: 16, col: 2, value: 'TOTAUX' },
      { row: 16, col: 3, value: '-' },
      { row: 16, col: 4, value: '-' },
      { row: 16, col: 5, value: '-' },
      { row: 16, col: 6, value: '-' },
      { row: 16, col: 7, value: '-' },
      { row: 16, col: 8, value: '-' },
      { row: 16, col: 9, value: formatPrice(taxable) },
      { row: 16, col: 10, value: formatPrice(taxable * 0.19) },
      { row: 16, col: 11, value: formatPrice(stampTax) },
      { row: 16, col: 12, value: formatPrice(taxable * 1.19) }
    ],
    {
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    }
  )

  const newBuffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(newBuffer, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="recapitulatif_du_chiffre_d_affaires_du_${format(
        searchParams.get('from')?.toString()!,
        'dd-MM-yyyy'
      )}_au_${format(searchParams.get('to')?.toString()!, 'dd-MM-yyyy')}.xlsx"`
    }
  })
}
