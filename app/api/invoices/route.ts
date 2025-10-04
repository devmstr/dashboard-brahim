import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { InvoiceSchemaType } from '@/lib/validations/invoice'
import { generateId } from '@/helpers/id-generator'
import { generateInvoiceReference } from '@/lib/helpers'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as InvoiceSchemaType

    const {
      date,
      name,
      address,
      tradeRegisterNumber,
      registrationArticle,
      taxIdNumber,
      type,
      status,
      paymentMode,
      purchaseOrder,
      deliverySlip,
      discountRate,
      refundRate,
      stampTaxRate,
      offerValidity,
      guaranteeTime,
      deliveryTime,
      note,
      total,
      subtotal,
      tax,
      items,
      histories,
      clientId,
      orderId
    } = body

    const id = type === 'FINAL' ? generateId('FF') : generateId('FP')

    const reference = await generateInvoiceReference(type)
    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        id,
        reference,
        date,
        name,
        address,
        tradeRegisterNumber,
        registrationArticle,
        taxIdNumber,
        type,
        status,
        paymentMode,
        purchaseOrder,
        deliverySlip,
        discountRate,
        refundRate,
        stampTaxRate,
        offerValidity,
        guaranteeTime,
        deliveryTime,
        note,
        total,
        subtotal,
        tax,
        ...(clientId && {
          Client: {
            connect: {
              id: clientId
            }
          }
        }),
        ...(orderId && {
          Order: {
            connect: {
              id: orderId
            }
          }
        }),
        ...(items?.length
          ? {
              items: {
                createMany: {
                  data: items.map(({ id, ...item }) => item)
                }
              }
            }
          : {})
      },
      include: {
        items: true
      }
    })

    revalidatePath('/dashboard/ledger')
    return NextResponse.json({ id: invoice.id })
  } catch (error: any) {
    console.log(error)
    return NextResponse.json(
      { message: 'Internal server error' },
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
