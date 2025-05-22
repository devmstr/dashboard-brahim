import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { z } from 'zod'
import { skuId } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

// Define the expected request body schema
const InvoiceSchema = z.object({
  customer: z.any().optional(), // Accept any client object for now
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number()
    })
  ),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = InvoiceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid request', errors: parsed.error.errors },
        { status: 400 }
      )
    }
    const { customer, items, subtotal, tax, total } = parsed.data

    // Generate a unique invoice number in the format YY-XXXX (e.g., 25-0023)
    const now = new Date()
    const year = now.getFullYear()
    const yearShort = year.toString().slice(-2)
    // Find the highest invoice number for this year
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        number: {
          startsWith: `${yearShort}-`
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    let nextSeq = 1
    if (lastInvoice && lastInvoice.number) {
      const match = lastInvoice.number.match(/^(\d{2})-(\d{4})$/)
      if (match) {
        nextSeq = parseInt(match[2], 10) + 1
      }
    }
    const invoiceNumber = `${yearShort}-${nextSeq.toString().padStart(4, '0')}`

    // Find or use clientId if customer is present
    let clientId: string | null = null
    if (customer?.id) {
      clientId = customer.id
    }

    if (!clientId) {
      return NextResponse.json(
        { message: 'A valid client is required to create an invoice.' },
        { status: 400 }
      )
    }
    const id = skuId('FA')
    if (!id) {
      return NextResponse.json(
        { message: 'Failed to generate invoice ID.' },
        { status: 500 }
      )
    }

    // Store items and cart details in metadata (since Radiator[] is a relation, not a nested create)
    const invoice = await prisma.invoice.create({
      data: {
        id,
        number: invoiceNumber,
        customerName: customer?.name || null,
        clientId,
        subtotal,
        tax,
        total,
        items: {
          connect: items.map((item) => ({
            id: item.id
          }))
        },
        metadata: {
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
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
