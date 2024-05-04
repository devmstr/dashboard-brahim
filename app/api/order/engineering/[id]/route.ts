import db from '@/lib/db'
import { OrderSchema } from '@/lib/validations/order'
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher'
import { z } from 'zod'

type FullOrder = z.infer<typeof OrderSchema>

export async function PATCH(req: Request, params: { params: Params }) {
  try {
    const { technical, ...orderData } = (await req.json()) as FullOrder
    const { id } = params.params

    const order = await db.order.update({
      where: { id },
      data: {
        serialNumber: orderData.serialNumber,
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
