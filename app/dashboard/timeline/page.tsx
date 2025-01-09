import { Card } from '@/components/card'
import { OrdersGanttChart } from '@/components/orders-grant-chart'
import db from '@/lib/db'
import React from 'react'
import { AddOrderDialog } from './add-order.dialog'
import { DaysCalculatorDialog } from '@/components/days-calculator.dialog'
import { progress } from 'framer-motion'
import data from './data.json'

interface PageProps {}

const Page: React.FC<PageProps> = async () => {
  return (
    <Card className="">
      <OrdersGanttChart
        data={data.map((record) => ({
          ...record,
          receivingDate: new Date(record.receivingDate),
          startDate: new Date(record.startDate),
          endDate: new Date(record.endDate),
          actualEndDate: new Date(record.actualEndDate)
        }))}
      />
    </Card>
  )
}

export default Page
