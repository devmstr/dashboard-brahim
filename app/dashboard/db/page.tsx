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
      Orders: {
        include: {
          Client: true
        }
      },
      Models: {
        include: {
          Types: true,
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
    const { Orders, Models, ...rest } = radiator
    const company = Orders[0]?.Client.name || '_'
    const model = Models[0]?.name || '_'
    const brand = Models[0]?.Family?.Brand.name || '_'
    return {
      ...rest,
      dirId: rest.directoryId || '_',
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
      <DatabaseTable userRole={role as UserRole} data={data} />
    </Card>
  )
}

export default Page
