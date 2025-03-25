import { Card } from '@/components/card'
import { OrderTable } from '@/components/orders-table'
// import data from './data.json'
import React from 'react'

interface PageProps {}

const Page: React.FC<PageProps> = async ({}: PageProps) => {
  return (
    <Card className="">
      <OrderTable
        data={[
          {
            id: 'COXL5R6T8',
            customer: 'Mohamed',
            phone: '0776459823',
            deadline: new Date().toISOString(),
            status: 'Encours',
            progress: 13,
            state: 'Ouargla',
            items: 5,
            total: 267000
          }
        ]}
        userRole={'SALES_AGENT'}
      />
    </Card>
  )
}

export default Page
