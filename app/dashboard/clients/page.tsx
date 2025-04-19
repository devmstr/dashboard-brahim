import { AddNewClientDialogButton } from '@/components/add-new-client.button'
import { Card } from '@/components/card'
import { ClientTable } from '@/components/client-table'
import db from '@/lib/db'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const clients = await db.client.findMany({
    where: { isCompany: true },
    orderBy: { updatedAt: 'desc' },
    include: {
      Address: { include: { City: true } },
      _count: {
        select: { Orders: true }
      }
    }
  })

  return (
    <Card className="">
      <div className="flex justify-end items-center gap-3 mb-5">
        <AddNewClientDialogButton />
      </div>
      <ClientTable
        data={clients.map(
          ({
            _count: { Orders: orderCount },
            label,
            phone,
            name,
            email,
            isCompany,
            Address,
            id
          }) => ({
            id,
            name,
            phone,
            email,
            label,
            isCompany,
            city: Address?.City.name as string,
            orderCount
          })
        )}
      />
    </Card>
  )
}

export default Page
