import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { z } from 'zod'
import { Invoice } from '@/types'
import { revalidatePath } from 'next/cache'
import { isEqual } from 'lodash' // Install lodash if not already
import { getCurrentUser } from '@/lib/session'

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
            Radiator: true
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
    const user = await getCurrentUser()
    if (!user)
      return NextResponse.json(
        { message: 'Sorry you are not authenticated' },
        { status: 404 }
      )

    const { id } = params
    const body = (await req.json()) as Invoice & { Client: any }

    const {
      id: invoiceId,
      orderId,
      clientId,
      items,
      Client,
      ...invoiceData
    } = body

    // Step 1: Fetch existing invoice with items
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true }
    })

    if (!existingInvoice) {
      return NextResponse.json(
        { message: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Step 2: Compare items (by label only — TODO: make deeper if needed)
    const oldItems = existingInvoice.items.map(
      ({ label, price, quantity }) => ({ label, price, quantity })
    )
    const newItems =
      items?.map(({ label, price, quantity }) => ({
        label,
        price,
        quantity
      })) ?? []

    const itemsChanged = !isEqual(oldItems, newItems)

    let updatedInvoice

    if (itemsChanged) {
      const newItemsData = items.map(({ id, ...rest }) => rest)

      const [_, invoice] = await prisma.$transaction([
        // TODO:fix the history logic
        // Save history
        prisma.invoiceHistory.create({
          data: {
            invoiceId: id,
            changedBy: user.name,
            snapshot: {
              ...existingInvoice,
              items: existingInvoice.items.map(({ invoiceId, ...i }) => i)
            },
            reason: 'Modification des titres des articles'
          }
        }),

        // Delete old items
        prisma.invoiceItem.deleteMany({
          where: { invoiceId: id }
        }),

        // Update invoice and create new items
        prisma.invoice.update({
          where: { id },
          data: {
            ...invoiceData,
            items: {
              createMany: {
                data: newItemsData.map(
                  ({ number, amount, label, price, quantity }) => ({
                    number,
                    amount,
                    label,
                    price,
                    quantity
                  })
                )
              }
            }
          }
        })
      ])

      updatedInvoice = invoice
    } else {
      // No items change, just update the invoice metadata
      updatedInvoice = await prisma.invoice.update({
        where: { id },
        data: {
          ...invoiceData
        }
      })
    }

    revalidatePath('/dashboard/ledger')

    return NextResponse.json(updatedInvoice)
  } catch (error: any) {
    console.error('❌ PATCH error:', error)
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
