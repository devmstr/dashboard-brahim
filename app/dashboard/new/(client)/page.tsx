import { ClientForm } from '@/components/client.form'
import db from '@/lib/db'
import { ClientType } from '@/lib/validations'
import React from 'react'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const data = (await db?.client.findMany({
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
  })) as ClientType[]

  return (
    <div className="max-w-6xl mx-auto">
      <ClientForm data={data} />
    </div>
  )
}

export default Page
