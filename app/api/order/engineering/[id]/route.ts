import db from '@/lib/db'
import { OrderSchema } from '@/lib/validations/order'
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher'
import { z } from 'zod'

type FullOrder = z.infer<typeof OrderSchema>

export async function PATCH(req: Request, params: { params: Params }) {
  try {
    const { technical: technicalData, ...orderData } =
      (await req.json()) as FullOrder
    const { id } = params.params

    const {
      Technical: technical,
      Client: customer,
      ...order
    } = await db.order.update({
      where: { id },
      data: {
        serialNumber: orderData.serialNumber,
        Technical: {
          create: {
            ...technicalData,
            pas: technicalData.pas.toString(),
            nr: +technicalData.nr!,
            ec: +technicalData.ec!,
            lar1: +technicalData.lar1!,
            lon: +technicalData.lon!,
            lar2: +technicalData.lar2!
          }
        }
      },
      include: {
        Technical: true,
        Client: true
      }
    })
    return new Response(
      JSON.stringify({
        ...order,
        technical,
        customer
      })
    )
  } catch (error) {
    console.log(error)
    return new Response(JSON.stringify({ message: 'not found 404' }), {
      status: 404
    })
  }
}
