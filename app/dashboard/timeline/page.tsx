import { Card } from '@/components/card'
import { GanttChart } from '@/components/grant-chart'
import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { coid } from '@/lib/utils'
import db from '@/lib/db'
import { z } from 'zod'
import { OrderSchema } from '@/lib/validations/order'
import { ROLES } from '@/config/accounts'

interface PageProps {}

type TimeLineRecord = z.infer<typeof OrderSchema> & { id: string }

const getData = async () => {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const jsonData = await res.json()
    return jsonData
  } catch (error) {
    console.log(error)
    return []
  }
}

const Page: React.FC<PageProps> = async () => {
  // await for 1 second to simulate loading
  const session = await getServerSession(authOptions)
  const data = await getData()
  const newOrderId = await coid(db)
  return (
    <Card className="">
      <GanttChart
        newOrderId={newOrderId}
        abilityToMove={false}
        abilityToAdd={session?.user?.role === ROLES.SALES}
        data={data.map((dp: any) => ({
          id: dp.id,
          receivingDate: dp.receivingDate,
          startDate: dp?.startDate,
          endDate: dp?.endDate,
          actualEndDate: dp?.actualEnd,
          collapsed: true
        }))}
      />
    </Card>
  )
}

export default Page
