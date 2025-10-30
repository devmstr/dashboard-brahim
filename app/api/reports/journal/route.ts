// app/api/reports/journal/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { format } from 'date-fns'
import { Prisma } from '@prisma/client'
import { formatPrice } from '@/lib/utils'

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

/* --------------------------------------------------------------
   GET – generate CSV or JSON
   -------------------------------------------------------------- */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // ---------- 1. Build Prisma WHERE clause ----------
  const from = parseDateStart(searchParams.get('from'))
  const to = parseDateEnd(searchParams.get('to'))
  console.log({ from, to })
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
      id: true,
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

  // ---------- 3. Handle format ----------
  const formatParam = searchParams.get('format')
  if (formatParam === 'json') {
    return NextResponse.json(invoices)
  }

  // Default to CSV
  const headers = [
    'Date',
    'N°',
    'Société',
    'Total(HT)',
    'Remise',
    'RG',
    'Timbre',
    'TVA',
    'TTC'
  ]

  const rows = invoices.map((i) => [
    i.createdAt ? format(i.createdAt, 'yyyy-MM-dd') : '',
    i.reference.substring(i.reference.length - 3) || '',
    i.Client?.name,
    formatPrice(i.subtotal),
    formatPrice(i.discount),
    formatPrice(i.refund),
    formatPrice(i.stampTax),
    formatPrice(i.vat),
    formatPrice(i.total)
  ])

  const csvLines = [
    headers.join(','),
    ...rows.map((r) => r.map((c) => `"${c}"`).join(','))
  ]

  const csvContent = csvLines.join('\n')

  const buffer = Buffer.from(csvContent, 'utf-8')

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="journal_${format(
        new Date(),
        'yyyy-MM-dd'
      )}.csv"`
    }
  })
}
