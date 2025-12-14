import { Card } from '@/components/card'
import { DatabaseTable } from './database-table'
import { useEffect } from 'react'
import prisma from '@/lib/db'
import { getUserRole } from '@/lib/session'
import { UserRole } from '@/types'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const role = await getUserRole()
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
      CarType: {
        include: {
          Model: {
            include: {
              Family: {
                include: {
                  Brand: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })
  const data = radiators.map((radiator) => {
    const { OrderItems, CarType, ...rest } = radiator
    const model = CarType?.Model?.name || '_'
    const brand = CarType?.Model?.Family?.Brand?.name || '_'
    const type = CarType?.name || '_'
    return {
      ...rest,
      dirId: rest.dirId || '_',
      barcode: rest.barcode || '_',
      label: rest.label || '_',
      type,
      model,
      brand,
      createdAt: rest.createdAt.toLocaleString()
    }
  })
  return (
    <Card>
      {/*  */}
      <DatabaseTable userRole={role as UserRole} data={data} />
    </Card>
  )
}

export default Page
