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
      OrdersItems: {
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
    const items = order.OrdersItems.length || 0
    const total = order.OrdersItems.reduce((sum: number, item: any) => {
      return sum + (item.Radiator?.Price?.unit || 0)
    }, 0)
    const allItemsValid: boolean =
      order.OrderItems?.every((item: OrderItem) => item.status === 'Valide') ||
      false
    return {
      id: order.id,
      customer: order.Client?.name || '—',
      phone: order.Client?.phone || '—',
      deadline: order.deadline.toISOString(),
      status: allItemsValid ? 'Valide' : order.status ?? 'Prévu',
      progress: order.progress || 0,
      state: order.Client?.Address?.Province.name || '—',
      items,
      total: total,
      createdAt: order.createdAt
    } as OrderTableEntry
  })

  return (
    <Card className="">
      {/* download all article button  */}
      <OrderTable data={data} userRole="SALES_AGENT" />
    </Card>
  )
}

export default Page
