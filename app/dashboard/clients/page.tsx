import { AddNewClientDialogButton } from '@/components/add-new-client.button'
import { Card } from '@/components/card'
import { ClientTable } from '@/components/client-table'
import prisma from '@/lib/db'
import { formatPhoneNumber } from '@/lib/utils'
import { notFound } from 'next/navigation'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const dbRecords = await prisma?.client.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      Address: {
        include: {
          Province: true,
          Country: true,
          City: true
        }
      },
      _count: {
        select: { Orders: true }
      }
    }
  })
  if (!dbRecords) return notFound()
  const data = dbRecords.map(({ Address, ...client }) => ({
    ...client,
    phone: formatPhoneNumber(client.phone),
    ...(Address && {
      street: Address.street,
      cityId: Address.cityId,
      provinceId: Address.provinceId,
      countryId: Address.countryId,
      country: Address.Country.name,
      province: Address.Province.name,
      city: Address.City.name,
      zip: Address.City.zipCode
    })
  }))
  return (
    <Card className="">
      <div className="flex justify-end items-center gap-3 mb-5">
        <AddNewClientDialogButton />
      </div>
      <ClientTable data={data} />
    </Card>
  )
}

export default Page
