import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { z } from 'zod'
import { skuId } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

const InvoiceSchema = z.object({
  customer: z
    .object({
      id: z.string().nullable().optional(),
      name: z.string().optional(),
      address: z.string().optional(),
      rc: z.string().optional(),
      nif: z.string().optional(),
      ai: z.string().optional()
    })
    .optional(),
  items: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
        quantity: z.number()
      })
    )
    .min(1, 'At least one item is required'),
  type: z.enum(['PROFORMA', 'FINAL']).optional(),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number()
})

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const isDraft = searchParams.get('isDraft') === 'true'

    const body = await req.json()
    const parsed = InvoiceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid request', errors: parsed.error.errors },
        { status: 400 }
      )
    }

    const { customer, items, subtotal, tax, total } = parsed.data

    // Final or Proforma?
    const type = parsed.data.type || (isDraft ? 'PROFORMA' : 'FINAL')

    const now = new Date()
    const yearShort = now.getFullYear().toString().slice(-2)
    const prefix = (type === 'FINAL' ? 'FF' : 'FP') + yearShort + '-'

    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        number: { startsWith: prefix },
        type
      },
      orderBy: { createdAt: 'desc' }
    })

    let nextSeq = 1
    if (lastInvoice?.number) {
      const match = lastInvoice.number.match(/^(FF|FP)(\d{2})-(\d{4})$/)
      if (match) {
        nextSeq = parseInt(match[3], 10) + 1
      }
    }

    const invoiceNumber = `${prefix}${nextSeq.toString().padStart(4, '0')}`
    const id = skuId(type === 'FINAL' ? 'FF' : 'FP')
    if (!id) {
      return NextResponse.json(
        { message: 'Failed to generate invoice ID.' },
        { status: 500 }
      )
    }

    const hasValidClient = !!customer?.id

    if (!hasValidClient && type === 'FINAL') {
      return NextResponse.json(
        { message: 'A valid client is required to create a FINAL invoice.' },
        { status: 400 }
      )
    }

    const invoice = await prisma.invoice.create({
      data: {
        id,
        number: invoiceNumber,
        type,
        clientName: customer?.name,
        clientAddress: customer?.address,
        clientId: hasValidClient ? customer.id! : undefined,
        subtotal,
        tax,
        total,
        ...(type === 'FINAL'
          ? {
              items: {
                connect: items.map((item) => ({ id: item.id }))
              }
            }
          : {}),
        metadata: {
          ...(hasValidClient ? {} : { client: customer }),
          items: items.map((item) => ({
            id: item.id,
            label: item.name,
            price: item.price,
            quantity: item.quantity,
            amount: item.price * item.quantity
          }))
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
