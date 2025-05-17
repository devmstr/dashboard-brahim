import { Card } from '@/components/card'
import { DatabaseTable } from './database-table'
import { useEffect } from 'react'
import prisma from '@/lib/db'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const radiators = await prisma.radiator.findMany({
    select: {
      id: true,
      dir: true,
      barcode: true,
      label: true,
      createdAt: true,
      OrderItems: {
        select: {
          Order: {
            select: {
              Client: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      },
      Models: {
        select: {
          name: true,
          Family: {
            select: {
              Brand: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }
    }
  })
  const data = radiators.map((radiator) => {
    const { OrderItems, Models, ...rest } = radiator
    const company = OrderItems[0]?.Order?.Client.name || '_'
    const model = Models.map(({ name }) => name).join(', ') || '_'
    const brand =
      Models.map(
        ({
          Family: {
            Brand: { name }
          }
        }) => name
      ).join(', ') || '_'
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
