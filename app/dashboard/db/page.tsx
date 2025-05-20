import { Card } from '@/components/card'
import { DatabaseTable } from './database-table'
import { useEffect } from 'react'
import prisma from '@/lib/db'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const radiators = await prisma.radiator.findMany({
    include: {
      OrderItems: {
        include: {
          Order: {
            include: {
              Client: true
            }
          }
        }
      },
      Models: {
        include: {
          Family: {
            include: {
              Brand: true
            }
          }
        }
      }
    }
  })
  const data = radiators.map((radiator) => {
    const { OrderItems, Models, ...rest } = radiator
    const company = OrderItems[0]?.Order?.Client.name || '_'
    const model = Models[0]?.name || '_'
    const brand = Models[0]?.Family?.Brand.name || '_'
    return {
      ...rest,
      dirId: rest.dir || '_',
      barcode: rest.barcode || '_',
      designation: rest.label || '_',
      company,
      model,
      brand,
      createdAt: rest.createdAt.toLocaleString()
    }
  })
  return (
    <Card>
      <DatabaseTable data={data} />
    </Card>
  )
}

export default Page
