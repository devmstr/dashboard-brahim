import { Card } from '@/components/card'
import { GanttChart } from '@/components/grant-chart'
import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { OrderTableEntry } from '@/types'
import { coid } from '@/lib/utils'
import db from '@/lib/db'
interface PageProps {}

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
        abilityToMove={
          session?.user?.role === 'production' ||
          session?.user?.role === 'admin'
        }
        abilityToAdd={session?.user?.role === 'sales'}
        data={data}
      />
    </Card>
  )
}

export default Page
