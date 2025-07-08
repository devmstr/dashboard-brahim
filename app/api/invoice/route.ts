import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { z } from 'zod'
import { skuId } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

const invoiceSchema = z.object({
  id: z.string(),
  reference: z.string(),
  date: z.string(), // Use `z.date()` if parsed as a JS Date object
  name: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  tradeRegisterNumber: z.string().nullable().optional(),
  registrationArticle: z.string().nullable().optional(),
  taxIdNumber: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  purchaseOrder: z.string().nullable().optional(),
  deliverySlip: z.string().nullable().optional(),
  discountRate: z.number().nullable().optional().default(0),
  refundRate: z.number().nullable().optional().default(0),
  stampTaxRate: z.number().nullable().optional().default(0),
  offerValidity: z.string().nullable().optional(),
  guaranteeTime: z.number().nullable().optional(),
  deliveryTime: z.number().nullable().optional(),
  total: z.number().nullable().optional(),
  subtotal: z.number().nullable().optional(),
  tax: z.number().nullable().optional(),
  items: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
        quantity: z.number(),
        radiatorId: z.string().optional()
      })
    )
    .min(1, 'At least one item is required'),
  type: z.enum(['PROFORMA', 'FINAL']).optional(),
  paymentMode: z
    .enum([
      'Espèces',
      'Versement',
      'Espèces + Versement',
      'Virement',
      'Cheque',
      'À terme'
    ])
    .optional(),
  note: z.string().optional(),
  status: z.enum(['PAID', 'UNPAID', 'OVERDUE']).optional(),
  clientId: z.string().optional()
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

    const {
      id,
      reference,
      date,
      name,
      address,
      tradeRegisterNumber,
      registrationArticle,
      taxIdNumber,
      dueDate,
      purchaseOrder,
      deliverySlip,
      discountRate,
      refundRate,
      stampTaxRate,
      offerValidity,
      guaranteeTime,
      deliveryTime,
      total,
      subtotal,
      tax,
      items,
      type,
      paymentMode,
      note,
      status,
      clientId
    } = parsed.data

    // Convert date fields to Date objects
    const dateObj = date ? new Date(date) : new Date()
    const dueDateObj = dueDate ? new Date(dueDate) : undefined
    const offerValidityObj = offerValidity ? new Date(offerValidity) : undefined

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        id,
        reference,
        date: dateObj,
        name: name ?? undefined,
        address: address ?? undefined,
        tradeRegisterNumber: tradeRegisterNumber ?? undefined,
        registrationArticle: registrationArticle ?? undefined,
        taxIdNumber: taxIdNumber ?? undefined,
        type: type ?? undefined,
        status: status ?? undefined,
        paymentMode: paymentMode ?? undefined,
        dueDate: dueDateObj,
        purchaseOrder: purchaseOrder ?? undefined,
        deliverySlip: deliverySlip ?? undefined,
        discountRate: discountRate ?? 0,
        refundRate: refundRate ?? 0,
        stampTaxRate: stampTaxRate ?? 0,
        offerValidity: offerValidityObj,
        guaranteeTime: guaranteeTime ?? undefined,
        deliveryTime: deliveryTime ?? undefined,
        note: note ?? undefined,
        total: total ?? undefined,
        subtotal: subtotal ?? undefined,
        tax: tax ?? undefined,
        clientId: clientId ?? undefined,
        items: {
          createMany: {
            data: items
          }
        }
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
