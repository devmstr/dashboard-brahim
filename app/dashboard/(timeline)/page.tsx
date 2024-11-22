import React from 'react'
import db from '@/lib/db'
import { Card } from '@/components/card'
import { DependenceType, GanttChart } from '@/components/grant-chart'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { coid } from '@/lib/utils'
import { TimeLineRecord } from '@/lib/validations/order'
import { ROLES } from '@/config/accounts'
import { AddOrderDialog } from '@/components/add-order.dialog'
import { DaysCalculatorDialog } from '@/components/days-calculator.dialog'
import { ProductionDaysProvider } from '@/components/production-days.provider'

interface PageProps {}

const Page: React.FC<PageProps> = async () => {
  const session = await getServerSession(authOptions)
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/orders`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const data = await res.json()

  const newOrderId = await coid(db)

  return (
    <Card className="">
      {session?.user?.role === ROLES.SALES && (
        <ProductionDaysProvider>
          <div className="flex justify-end items-center gap-3">
            <DaysCalculatorDialog />
            <AddOrderDialog id={newOrderId} />
          </div>
        </ProductionDaysProvider>
      )}
      <GanttChart
        data={data.map((dp: any) => ({
          id: dp.id,
          receivingDate: dp.receivingDate,
          startDate: dp?.startDate,
          endDate: dp?.endDate,
          actualEndDate: dp?.actualEnd,
          collapsed: true
        }))}
        // dependencies={data.map(({ id }: { id: string }) => {
        //   const prefix = id.slice(0, 2)
        //   const nextId = `${prefix}-${(parseInt(id.slice(3)) + 1)
        //     .toString()
        //     .padStart(4, '0')}`
        //   return {
        //     from: id,
        //     to: nextId,
        //     type: 'finish_start',
        //     color: 'purple'
        //   }
        // })}
      />
    </Card>
  )
}

export default Page
