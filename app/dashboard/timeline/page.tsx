import { Card } from '@/components/card'
import { GanttChart } from '@/components/grant-chart'
import db from '@/lib/db'
import React from 'react'
import { AddOrderDialog } from './add-order.dialog'
import { DaysCalculatorDialog } from '@/components/days-calculator.dialog'

interface PageProps {}

const Page: React.FC<PageProps> = async () => {
  // get all countries from db
  const countries =
    (await db.country.findMany({
      select: {
        name: true
      }
    })) || []
  const provinces =
    (await db.wilaya.findMany({
      select: {
        name: true
      }
    })) || []

  return (
    <Card className="">
      <GanttChart
        data={[
          {
            id: 'COXL5R6T8',
            receivingDate: '',
            startDate: '',
            endDate: '',
            actualEndDate: ''
          }
        ]}
        // data={data?.map((dp: any) => ({
        //   id: dp.id,
        //   receivingDate: dp.receivingDate,
        //   startDate: dp?.startDate,
        //   endDate: dp?.endDate,
        //   actualEndDate: dp?.actualEnd,
        //   collapsed: true
        // }))}
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
