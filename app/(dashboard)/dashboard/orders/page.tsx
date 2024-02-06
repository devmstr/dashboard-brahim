import { Card } from '@/components/card'
import { GanttChart } from '@/components/grant-chart'
import React from 'react'

interface PageProps {}

const Page: React.FC<PageProps> = async ({}: PageProps) => {
  // await for 1 second to simulate loading
  return (
    <Card className="">
      <GanttChart />
    </Card>
  )
}

export default Page
