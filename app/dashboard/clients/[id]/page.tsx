import { Card } from '@/components/card'
import { notFound, useRouter } from 'next/navigation'
import { useState } from 'react'
import { EditClientForm } from './one-client.form'
import { formatPhoneNumber } from '@/lib/utils'
import prisma from '@/lib/db'

// Example of how to use the EditClientForm component
export default async function EditClientPage({
  params: { id }
}: {
  params: { id: string }
}) {
  const record = await prisma.client.findUnique({
    where: { id },
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
          phone: formatPhoneNumber(client.phone),
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
