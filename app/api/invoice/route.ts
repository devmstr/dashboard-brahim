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
      addressId: z.string().optional(),
      label: z.string().optional(),
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
  dueDate: z.string().optional(),
  note: z.string().optional(),
  status: z.enum(['PAID', 'UNPAID', 'OVERDUE']).optional(),
  tax: z.number(),
  total: z.number(),
  metadata: z.any().optional()
})

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const body = await req.json()
    const parsed = InvoiceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid request', errors: parsed.error.errors },
        { status: 400 }
      )
    }

    const {
      customer,
      items,
      subtotal,
      tax,
      total,
      type,
      paymentMode,
      dueDate,
      note,
      status,
      metadata
    } = parsed.data

    // Complete customer object if not completed
    let client = customer

    const existedClient = await prisma.client.findUnique({
      where: { id: customer?.id || undefined },
      include: { Address: true }
    })

    if (existedClient) {
      client = {
        ...customer,
        id: existedClient.id,
        name: existedClient.name || customer?.name,
        label: existedClient.label || customer?.label,
        address: existedClient.Address?.street || customer?.address,
        rc: existedClient.tradeRegisterNumber || customer?.rc,
        nif: existedClient.fiscalNumber || customer?.nif,
        ai: existedClient.statisticalIdNumber || customer?.ai
      }
    } else {
      client = { ...customer, id: null }
    }

    // Validate required customer fields
    if (client && !client.name) {
      return NextResponse.json(
        { message: 'Customer name is required.' },
        { status: 400 }
      )
    }
    if (client && !client.address) {
      return NextResponse.json(
        { message: 'Customer address is required.' },
        { status: 400 }
      )
    }
    if (client && !client.rc) {
      return NextResponse.json(
        { message: 'Customer trade register number (RC) is required.' },
        { status: 400 }
      )
    }
    if (client && !client.nif) {
      return NextResponse.json(
        { message: 'Customer fiscal number (NIF) is required.' },
        { status: 400 }
      )
    }
    if (client && !client.ai) {
      return NextResponse.json(
        { message: 'Customer statistical ID number (AI) is required.' },
        { status: 400 }
      )
    }
    if (!items || items.length === 0) {
      return NextResponse.json(
        { message: 'At least one item is required.' },
        { status: 400 }
      )
    }

    // Determine invoice type
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
    const hasValidClient = !!client?.id
    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        id,
        number: invoiceNumber,
        type,
        clientName: client?.name,
        clientAddress: client?.address,
        clientNif: client?.nif,
        clientRC: client?.rc,
        clientAi: client?.ai,
        clientId: client?.id,
        subtotal,
        tax,
        total,
        paymentMode,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        note,
        status,
        ...(type === 'FINAL'
          ? {
              items: {
                connect: items.map((item) => ({ id: item.id }))
              }
            }
          : {}),
        metadata: {
          ...(hasValidClient ? {} : { client: client }),
          items: items.map((item) => ({
            id: item.id,
            label: item.name,
            price: item.price,
            quantity: item.quantity,
            amount: item.price * item.quantity
          })),
          ...(metadata || {})
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
