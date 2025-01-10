import { Card } from '@/components/card'
import db from '@/lib/db'
import React from 'react'
import { AddOrderDialog } from './add-order.dialog'
import { DaysCalculatorDialog } from '@/components/days-calculator.dialog'
import { progress } from 'framer-motion'
import data from './data.json'
import OrdersTimeline from '@/components/orders-timeline'

interface PageProps {}

const Page: React.FC<PageProps> = async () => {
  return (
    <Card className="">
      <OrdersTimeline
        orders={data.map((record) => ({
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
