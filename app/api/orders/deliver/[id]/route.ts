import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { Router } from 'next/router'

// POST /api/orders/deliver/[id]
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const { quantity } = await request.json()

    if (!id || !quantity || isNaN(quantity) || quantity < 1) {
      return NextResponse.json(
        { message: 'Quantité invalide.' },
        { status: 400 }
      )
    }

    // Fetch the order item
    const orderItem = await prisma.orderItem.findUnique({ where: { id } })
    if (!orderItem) {
      return NextResponse.json(
        { message: 'Order item not found.' },
        { status: 404 }
      )
    }
    if (orderItem.status != 'Valide') {
      return NextResponse.json(
        { message: 'Seuls les articles validé peuvent être livrés.' },
        { status: 400 }
      )
    }

    // Only allow marking as delivered if quantity is valid
    if (quantity > orderItem.quantity!) {
      return NextResponse.json(
        { message: 'La quantité livrée dépasse la quantité commandée.' },
        { status: 400 }
      )
    }
    // Prevent delivered from exceeding quantity
    const prevDelivered = orderItem.delivered || 0
    if (prevDelivered + quantity > orderItem.quantity!) {
      return NextResponse.json(
        {
          message:
            'La quantité totale livrée ne peut pas dépasser la quantité commandée.'
        },
        { status: 400 }
      )
    }

    // Calculate new delivered count
    const totalDelivered = prevDelivered + quantity
    const isFullyDelivered = totalDelivered >= (orderItem.quantity || 0)
    const newStatus = isFullyDelivered ? 'Livré' : 'Prévu'

    // Update delivered count and status on OrderItem
    const updated = await prisma.orderItem.update({
      where: { id },
      data: {
        delivered: totalDelivered,
        status: newStatus
      }
    })

    // If linked to an order, update deliveredItems count on Order
    if (orderItem.orderId) {
      // Recalculate deliveredItems for the order
      const allItems = await prisma.orderItem.findMany({
        where: { orderId: orderItem.orderId }
      })
      const deliveredSum = allItems.reduce(
        (sum, item) => sum + (item.delivered || 0),
        0
      )
      await prisma.order.update({
        where: { id: orderItem.orderId },
        data: { deliveredItems: deliveredSum }
      })
    }

    // revalidate the order item cache
    revalidatePath(`/dashboard/orders/${orderItem.orderId}`)

    return NextResponse.json({
      message: 'Livraison enregistrée.',
      item: updated
    })
  } catch (error) {
    console.error('Error delivering order item:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la livraison.' },
      { status: 500 }
    )
  }
}
