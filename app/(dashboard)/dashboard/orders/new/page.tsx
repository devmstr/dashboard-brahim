import React from 'react'
import { Card } from '@/components/card'
import { AddOrderForm } from './add-order-form'

interface PageProps {}

const Page: React.FC<PageProps> = async ({}: PageProps) => {
  // await for 1 second to simulate loading
  return (
    <Card className="">
      <AddOrderForm />
    </Card>
  )
}

export default Page
