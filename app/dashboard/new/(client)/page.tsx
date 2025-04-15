import { ClientForm } from '@/components/client.form'
import db from '@/lib/db'
import React from 'react'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const frequentClients = await db?.client.findMany({
    where: { isCompany: true },
    orderBy: { updatedAt: 'desc' },
    include: {
      Address: {
        include: {
          City: true
        }
      },
      _count: {
        select: { Orders: true }
      }
    },
    take: 4
  })

  return (
    <div className="max-w-6xl mx-auto">
      <ClientForm
        data={[
          ...frequentClients.map(
            ({ _count: { Orders }, id, name, phone, label, Address }) => ({
              id,
              name,
              label,
              phone,
              city: Address?.City.name as string,
              orderCount: Orders
            })
          )
        ]}
      />
    </div>
  )
}

export default Page
