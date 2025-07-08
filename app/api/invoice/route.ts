import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { z } from 'zod'
import { skuId } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

const invoiceSchema = z.object({
  id: z.string(),
  reference: z.string(),
  date: z.string().nullable(), // Use `z.date()` if parsed as a JS Date object
  name: z.string().nullable(),
  address: z.string().nullable(),
  tradeRegisterNumber: z.string().nullable(),
  registrationArticle: z.string().nullable(),
  taxIdNumber: z.string().nullable(),
  purchaseOrder: z.string().nullable(),
  deliverySlip: z.string().nullable(),
  discountRate: z.number().nullable(),
  refundRate: z.number().nullable(),
  stampTaxRate: z.number().nullable(),
  offerValidity: z.string().nullable(),
  guaranteeTime: z.string().nullable(),
  deliveryTime: z.string().nullable(),
  total: z.number().nullable(),
  subtotal: z.number().nullable(),
  tax: z.number().nullable(),
  items: z
    .array(
      z.object({
        id: z.number(),
        label: z.string().nullable(),
        price: z.number().nullable(),
        quantity: z.number().nullable(),
        radiatorId: z.string().nullable()
      })
    )
    .nullable(),
  type: z.enum(['PROFORMA', 'FINAL']).nullable(),
  paymentMode: z
    .enum([
      'Espèces',
      'Versement',
      'Espèces + Versement',
      'Virement',
      'Cheque',
      'À terme'
    ])
    .nullable(),
  note: z.string().nullable(),
  status: z.enum(['PAID', 'UNPAID', 'OVERDUE']).nullable(),
  clientId: z.string().nullable()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = invoiceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid request', errors: parsed.error.errors },
        { status: 400 }
      )
    }

    const { items, ...invoiceSafe } = parsed.data

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        ...invoiceSafe,
        ...(items?.length
          ? {
              items: {
                createMany: {
                  data: items
                }
              }
            }
          : {})
      }
    })

    revalidatePath('/dashboard/ledger')
    return NextResponse.json({ id: invoice.id })
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        deletedAt: null
      },
      include: { Client: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(invoices)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updateData } = body
    if (!id) {
      return NextResponse.json(
        { message: 'Invoice id is required for update.' },
        { status: 400 }
      )
    }
    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData
    })
    return NextResponse.json(invoice)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
