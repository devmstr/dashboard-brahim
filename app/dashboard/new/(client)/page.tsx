import { ClientForm } from '@/components/client.form'
import db from '@/lib/db'
import { ClientValidationType } from '@/lib/validations'
import React from 'react'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const data = (await db?.client.findMany({
    where: { isCompany: true },
    orderBy: { updatedAt: 'desc' },
    include: {
      address: {
        include: {
          city: true
        }
      },
      _count: {
        select: { orders: true }
      }
    },
    take: 4
  })) as ClientValidationType[]

  return (
    <div className="max-w-6xl mx-auto">
      <ClientForm data={data} />
    </div>
  )
}

export default Page
