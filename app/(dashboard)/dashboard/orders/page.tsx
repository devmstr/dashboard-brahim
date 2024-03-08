import { Card } from '@/components/card'
import { OrderTable } from '@/components/orders-table'
import data from './data.json'
import React from 'react'
import { StatusVariant } from '@/types'

interface PageProps {}

const Page: React.FC<PageProps> = async ({}: PageProps) => {
  return (
    <Card className="">
      <OrderTable
        data={data.map((d) => ({ ...d, status: d.status as StatusVariant }))}
      />
    </Card>
  )
}

export default Page
