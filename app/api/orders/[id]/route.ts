import db from '@/lib/db'
import { OrderSchema } from '@/lib/validations/order'
import { NextApiRequest, NextApiResponse } from 'next'
import { NextRequest } from 'next/server'
import { z } from 'zod'

interface Params {
  id: string
}

export async function GET(req: Request, params: { params: Params }) {
  try {
    const { id } = params.params
    const order = await db.order.findUnique({
      where: { id },
      include: {
        Client: true,
        Technical: true
      }
    })
    if (!order) throw new Error()
    const { Client, Technical, ...orderData } = order
    return new Response(
      JSON.stringify({
        ...orderData,
        technical: Technical,
        customer: Client
      })
    )
  } catch (error) {
    return new Response(JSON.stringify({ message: 'not found 404' }), {
      status: 404
    })
  }
}
export async function DELETE(req: Request, params: { params: Params }) {
  try {
    const { id } = params.params
    const order = await db.order.delete({
      where: { id }
    })
    if (!order) throw new Error()
    return new Response(JSON.stringify(order))
  } catch (error) {
    return new Response(JSON.stringify({ message: 'not found 404' }), {
      status: 404
    })
  }
}

type FullOrder = z.infer<typeof OrderSchema>

export async function PATCH(req: Request, params: { params: Params }) {
  try {
    const { technical, customer, ...orderData } =
      (await req.json()) as FullOrder
    const { id } = params.params

    const order = await db.order.update({
      where: { id },
      data: {
        receivingDate: new Date(orderData.receivingDate!),
        quantity: +orderData.quantity!,
        price: +orderData.price!,
        deposit: +orderData.deposit!,
        remaining: +orderData.remaining!,
        status: orderData.status,
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
