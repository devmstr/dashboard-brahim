import { Card } from '@/components/card'
import db from '@/lib/db'
import React from 'react'
import { AddOrderDialog } from './add-order.dialog'
import { DaysCalculatorDialog } from '@/components/days-calculator.dialog'
import { progress } from 'framer-motion'
import data from './data.json'
import ComponentsTimeline from '@/components/gantt_chart/components-timeline'

interface PageProps {}

const Page: React.FC<PageProps> = async () => {
  return (
    <Card className="">
      <ComponentsTimeline
        tasks={data.map((record) => ({
          ...record,
          text: record.id,
          start_date: new Date(record.receivingDate),
          actual_start: new Date(record.startDate),
          end_date: new Date(record.endDate),
          actual_end: new Date(record.actualEndDate),
          progress: 0.6,
          parent: 0
        }))}
      />
    </Card>
  )
}

export default Page
