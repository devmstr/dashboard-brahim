import { Card } from '@/components/card'
import { notFound, useRouter } from 'next/navigation'
import { useState } from 'react'
import { EditClientForm } from './one-client.form'
import { formatPhoneNumber } from '@/lib/utils'

// Example of how to use the EditClientForm component
export default async function EditClientPage({
  params: { id }
}: {
  params: { id: string }
}) {
  const record = await prisma?.client.findFirst({
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
    }
  })
  if (!record) return notFound()
  const { Address, ...client } = record
  return (
    <Card className="space-y-6">
      <div className="">
        <h1 className="text-2xl font-bold">Modifier le client</h1>
        <p className="text-muted-foreground">
          Modifiez les informations du client ci-dessous.
        </p>
      </div>

      <EditClientForm
        data={{
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
        }}
      />
    </Card>
  )
}
