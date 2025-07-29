import React from 'react'
import { Card } from '@/components/card'
import { OrderTable } from '@/components/orders-table'
import prisma from '@/lib/db'
import { OrderTableEntry } from '@/types'
import { OrderItem } from '@prisma/client'

interface PageProps {}

const Page: React.FC<PageProps> = async ({}: PageProps) => {
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      createdAt: true,
      Client: {
        select: {
          name: true,
          phone: true,
          Address: {
            select: {
              Province: true
            }
          }
        }
      },
      OrderItems: {
        select: {
          status: true,
          _count: true
        }
      },
      deadline: true,
      status: true,
      progress: true
    },
    orderBy: { createdAt: 'desc' }
  })

  const data = orders.map((order: any) => {
    const items = order.OrderItems.length || 0
    const total = order.OrderItems.reduce((sum: number, item: any) => {
      return sum + (item.Radiator?.Price?.unit || 0)
    }, 0)

    return {
      id: order.id,
      customer: order.Client?.name || '—',
      phone: order.Client?.phone || '—',
      deadline: order.deadline.toISOString(),
      status: order.status,
      progress: order.progress || 0,
      state: order.Client?.Address?.Province.name || '—',
      items,
      total: total,
      createdAt: order.createdAt
    } as OrderTableEntry
  })
  console.log(data)

  return (
    <Card className="">
      {/* download all article button  */}
      <OrderTable data={data} userRole="SALES_AGENT" />
    </Card>
  )
}

export default Page
