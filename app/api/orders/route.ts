import { NextApiRequest } from 'next'
import db from '@/lib/db'
import { z } from 'zod'
import { OrderSchema } from '@/lib/validations/order'
import { Order } from '@prisma/client'
import { truncate } from 'lodash'

async function coid() {
  const currentYear = new Date().getUTCFullYear()
  const lastOrder = await db.order.findFirst({
    orderBy: {
      id: 'desc'
    }
  })
  const orderNumber = parseInt(lastOrder?.id.slice(3)!) + 1
  const id = `${currentYear.toString().slice(2)}-${orderNumber
    .toString()
    .padStart(4, '0')}`
  return id
}

type FullOrder = z.infer<typeof OrderSchema>

export async function GET(request: Request) {
  try {
    const orders = await db.order.findMany({
      include: {
        Client: true,
        Technical: true
      }
    })
    const mappedOrders = orders.map((i) => ({
      ...i,
      customer: i.Client,
      technical: i.Technical
    }))
    return new Response(JSON.stringify(mappedOrders))
  } catch (error) {
    return new Response(JSON.stringify({ message: 'not found 404' }), {
      status: 404
    })
  }
}

export async function POST(request: Request) {
  try {
    const { technical, customer, ...orderData } =
      (await request.json()) as FullOrder
    const order = await db.order.create({
      data: {
        id: await coid(),
        serialNumber: orderData.serialNumber,
        receivingDate: new Date(orderData.receivingDate!),
        quantity: +orderData.quantity!,
        price: +orderData.price!,
        deposit: +orderData.deposit!,
        remaining: +orderData.remaining!,
        Technical: {
          create: {
            ...technical,
            pas: technical.pas.toString(),
            nr: +technical.nr!,
            ec: +technical.ec!,
            lar1: +technical.lar1!,
            lon: +technical.lon!,
            lar2: +technical.lar2!
          }
        },
        Client: {
          connectOrCreate: {
            where: { phone: customer.phone },
            create: customer
          }
        }
      }
    })
    return new Response(JSON.stringify(order))
  } catch (error) {
    console.log(error)
    return new Response(JSON.stringify({ message: 'not found 404' }), {
      status: 404
    })
  }
}
