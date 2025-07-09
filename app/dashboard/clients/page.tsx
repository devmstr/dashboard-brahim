import { AddNewClientDialogButton } from '@/components/add-new-client.button'
import { Card } from '@/components/card'
import { ClientTable } from '@/components/client-table'
import db from '@/lib/db'
import { formatPhoneNumber } from '@/lib/utils'
import { notFound } from 'next/navigation'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const data = await db?.client.findMany({
    where: { isCompany: true },
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
    },
    take: 4
  })
  if (!data) return notFound()

  return (
    <Card className="">
      <div className="flex justify-end items-center gap-3 mb-5">
        <AddNewClientDialogButton />
      </div>
      <ClientTable
        data={data.map(({ Address, ...client }) => ({
          ...client,
          label: client.label ?? undefined,
          email: client.label ?? undefined,
          phone: formatPhoneNumber(client.phone),
          website: client.website ?? undefined,
          tradeRegisterNumber: client.tradeRegisterNumber ?? undefined,
          registrationArticle: client.registrationArticle ?? undefined,
          taxIdNumber: client.taxIdNumber ?? undefined,
          fiscalNumber: client.fiscalNumber ?? undefined,
          approvalNumber: client.approvalNumber ?? undefined,
          name: client.name ?? undefined,
          statisticalIdNumber: client.statisticalIdNumber ?? undefined,
          isCompany: client.isCompany ?? undefined,
          addressId: client.addressId ?? undefined,
          ...(Address && {
            street: Address.street ?? undefined,
            cityId: Address.cityId ?? undefined,
            provinceId: Address.provinceId ?? undefined,
            countryId: Address.countryId ?? undefined,
            country: Address.Country.name ?? undefined,
            province: Address.Province.name ?? undefined,
            city: Address.City.name ?? undefined,
            zip: Address.City.zipCode ?? undefined
          })
        }))}
      />
    </Card>
  )
}

export default Page
