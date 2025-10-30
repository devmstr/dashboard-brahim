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

type InvoiceLedgerRow = [
  string, // Date
  string, // Short reference
  string, // Client name
  string, // Gross before discount/refund
  string, // Discount
  string, // Refund
  string, // Subtotal
  string, // VAT
  string, // Stamp tax
  string // Total
]

/* --------------------------------------------------------------
   GET – generate CSV or JSON
   -------------------------------------------------------------- */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // ---------- 1. Build Prisma WHERE clause ----------
  const from = parseDateStart(searchParams.get('from'))
  const to = parseDateEnd(searchParams.get('to'))
  const type = searchParams.get('type') as 'FINAL' | 'PROFORMA' | null

  const where: Prisma.InvoiceWhereInput = {}

  const currentYear = new Date().getFullYear()
  where.createdAt = { gte: new Date(currentYear, 0, 1) }

  if (from && to) {
    where.createdAt = { gte: from, lte: to }
  }

  if (type) {
    where.type = type
  }

  // ---------- 2. Fetch the rows ----------
  const invoices = await prisma.invoice.findMany({
    where,
    select: {
      reference: true,
      type: true,
      total: true,
      subtotal: true,
      refund: true,
      discount: true,
      vat: true,
      stampTax: true,
      createdAt: true,
      Client: {
        select: {
          name: true
        }
      }
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
    'templates/ledger_excel_template.xlsx'
  )

  const file = await fs.readFile(templatePath)

  const workbook = new ExcelJS.Workbook()

  await workbook.xlsx.load(file as any)

  // Write computed data
  const sheet = workbook.getWorksheet(
    'Journal des factures'
  ) as ExcelJS.Worksheet

  const ledgerRows: InvoiceLedgerRow[] = invoices
    .filter(
      (inv) =>
        inv &&
        inv.createdAt &&
        inv.reference &&
        inv.subtotal != null &&
        inv.discount != null &&
        inv.refund != null &&
        inv.vat != null &&
        inv.stampTax != null &&
        inv.total != null
    )
    .map((inv) => [
      format(new Date(inv.createdAt!), 'dd-MM-yyyy'),
      inv.reference.substring(inv.reference.length - 3),
      inv.Client?.name ?? '',
      formatPrice(inv.subtotal! + inv.discount! + inv.refund!),
      formatPrice(inv.discount),
      formatPrice(inv.refund),
      formatPrice(inv.subtotal),
      formatPrice(inv.vat),
      formatPrice(inv.stampTax),
      formatPrice(inv.total)
    ])

  const totals = invoices.reduce(
    (acc, inv) => ({
      subtotal: acc.subtotal + Number(inv.subtotal),
      discount: acc.discount + Number(inv.discount),
      refund: acc.refund + Number(inv.refund),
      stampTax: acc.stampTax + Number(inv.stampTax),
      vat: acc.vat + Number(inv.vat),
      total: acc.total + Number(inv.total)
    }),
    { subtotal: 0, discount: 0, refund: 0, stampTax: 0, vat: 0, total: 0 }
  )

  // 2. Convert ledgerRows into edit instructions
  const edits = ledgerRows.flatMap((row, i) =>
    row.map((value, j) => ({
      row: i + 14,
      col: j + 2,
      value
    }))
  )

  // 3. Apply edits efficiently
  editCells(sheet, edits, { withBorder: true })

  // 4. Edit Totals
  editCells(sheet, [
    {
      row: 9,
      col: 6,
      value: formatPrice(totals.subtotal + totals.discount + totals.refund)
    },
    { row: 9, col: 8, value: formatPrice(totals.subtotal) },
    { row: 10, col: 6, value: formatPrice(totals.discount) },
    { row: 10, col: 8, value: formatPrice(totals.vat) },
    { row: 11, col: 6, value: formatPrice(totals.refund) },
    { row: 11, col: 8, value: formatPrice(totals.stampTax) },
    { row: 11, col: 11, value: formatPrice(totals.total) }
  ])
  const user = await getCurrentUser()
  const userName = user ? user.username : 'GUEST'
  // 5. edit the name metadata
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
  const newBuffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(newBuffer, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Journal_des_factures_du${format(
        searchParams.get('from')?.toString()!,
        'dd-MM-yyyy'
      )}_au_${format(searchParams.get('to')?.toString()!, 'dd-MM-yyyy')}.xlsx"`
    }
  })
}
