import { Card } from '@/components/card'
import { GanttChart } from '@/components/grant-chart'
import React from 'react'

interface PageProps {
  params: { id: string }
}

const Page: React.FC<PageProps> = async ({ params }: PageProps) => {
  // await for 1 second to simulate loading
  return (
    <Card className="">
      <GanttChart params={params} />
    </Card>
  )
}

export default Page
