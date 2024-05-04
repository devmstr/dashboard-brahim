import { Card } from '@/components/card'
import { OrderTable } from '@/components/orders-table'
// import data from './data.json'
import React from 'react'
import { OrderTableEntry, StatusVariant } from '@/types'
import { getServerSideProps } from 'next/dist/build/templates/pages'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

interface PageProps {}

const getData = async (): Promise<OrderTableEntry[]> => {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const jsonData = await res.json()
    return jsonData
  } catch (error) {
    console.log(error)
    return []
  }
}

const Page: React.FC<PageProps> = async ({}: PageProps) => {
  const session = await getServerSession(authOptions)
  const data = await getData()
  return (
    <Card className="">
      <OrderTable abilityToAdd={session?.user?.role === 'sales'} data={data} />
    </Card>
  )
}

export default Page
