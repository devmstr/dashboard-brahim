import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { z } from 'zod'

// PATCH schema for updating invoice
const InvoiceUpdateSchema = z.object({
  customerName: z.string().optional(),
  subtotal: z.number().optional(),
  tax: z.number().optional(),
  total: z.number().optional(),
  metadata: z.any().optional()
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        Client: true,
        items: {
          include: {
            Price: true
          }
        }
      }
    })
    if (!invoice) {
      return NextResponse.json(
        { message: 'Invoice not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(invoice)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await req.json()
    const parsed = InvoiceUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid request', errors: parsed.error.errors },
        { status: 400 }
      )
    }
    const invoice = await prisma.invoice.update({
      where: { id },
      data: parsed.data
    })
    return NextResponse.json(invoice)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { deletedAt: new Date() }
    })
    return NextResponse.json({
      ok: true,
      success: true,
      id: invoice.id,
      deletedAt: invoice.deletedAt
    })
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
