import { NextApiRequest } from 'next'
import db from '@/lib/db'
import { z } from 'zod'
import { OrderSchema } from '@/lib/validations/order'
import { truncate } from 'lodash'
// import { Order } from '@prisma/client'
import { coid } from '@/lib/utils'

type FullOrder = z.infer<typeof OrderSchema>

export async function GET(request: Request) {
  try {
    // const orders = await db.order.findMany({
    //   include: {
    //     Client: true,
    //     Technical: true
    //   },
    //   //order by id desc
    //   orderBy: {
    //     id: 'desc' // Order by 'id' in descending order
    //   }
    // })
    // const mappedOrders = orders.map((i) => ({
    //   ...i,
    //   customer: i.Client,
    //   technical: i.Technical
    // }))
    // return new Response(JSON.stringify(mappedOrders))
  } catch (error) {
    return new Response(JSON.stringify({ message: 'not found 404' }), {
      status: 404
    })
  }
}

export async function POST(request: Request) {
  try {
    const { technical, customer, ...orderData } =
      (await request.json()) as FullOrder & { id: string }
    // const order = await db.order.create({
    //   data: {
    //     id: orderData.id,
    //     serialNumber: orderData.serialNumber,
    //     receivingDate: new Date(orderData.receivingDate!),
    //     productionDays: +orderData.productionDays,
    //     type: orderData.type,
    //     manufacturing: orderData.manufacturing,
    //     quantity: +orderData.quantity!,
    //     price: +orderData.price!,
    //     deposit: +orderData.deposit!,
    //     remaining: +orderData.remaining!,
    //     status: orderData.status,
    //     Technical: {
    //       create: {
    //         ...technical,
    //         pas: technical.pas.toString(),
    //         nr: +technical.nr!,
    //         ec: +technical.ec!,
    //         lar1: +technical.lar1!,
    //         lon: +technical.lon!,
    //         lar2: +technical.lar2!
    //       }
    //     },
    //     Client: {
    //       connectOrCreate: {
    //         where: { phone: customer.phone },
    //         create: customer
    //       }
    //     }
    //   }
    // })
    // return new Response(JSON.stringify(order))
  } catch (error) {
    console.log(error)
    return new Response(JSON.stringify({ message: 'not found 404' }), {
      status: 404
    })
  }
}
