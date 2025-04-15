'use client'
import { AddOrderSchemaType } from '@/app/dashboard/timeline/add-order.dialog'
import { COMPANY_LABELS_TYPE } from '@/config/global'
import { clientSchema, ClientType } from '@/lib/validations'
import { ClientTableEntry, Customer } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ClientTable } from './client-table'
import CustomerSearchInput, {
  ClientWithOrdersCount
} from './customer-search.input'
import { Icons } from './icons'
import { useOrder } from './new-order.provider'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Separator } from './ui/separator'

export type FrequentClient = {
  id: string
  name: string
  label: string | null
  phone: string
  city: string | null
  orderCount: number
}

interface Props {
  data: FrequentClient[]
}

export const ClientForm: React.FC<Props> = ({ data }: Props) => {
  const { order, setOrder } = useOrder()
  const [customer, setCustomer] = useState<ClientWithOrdersCount | null>(null)
  const router = useRouter()

  const onSubmit = (formData: ClientType) => {
    if (!customer) return
    setOrder((prev) => ({
      ...prev,
      client: formData
    }))

    router.replace('new/order')
  }

  // Simple button action component
  const renderRowActions = (rowData: ClientTableEntry) => {
    return (
      <Button
        variant={'outline'}
        onClick={() => {
          console.log('Full row data:', rowData)
          setCustomer({
            id: rowData.id,
            Address: {
              City: { name: rowData.city }
            },
            name: rowData.name as string,
            phone: rowData.phone,
            _count: { Orders: rowData.orderCount || 0 }
          })
        }}
      >
        Choisir
      </Button>
    )
  }

  return (
    <CustomerSearchInput
      selected={customer}
      onSelectChange={(client: ClientWithOrdersCount | null) =>
        setCustomer(client)
      }
    >
      <div className=" flex flex-col gap-4 w-full">
        <Label className="text-foreground">Derniers Acheteurs</Label>
        <ClientTable
          className=""
          renderActions={renderRowActions}
          showColumnSelector={false}
          showLimitSelector={false}
          showSearch={false}
          showPaginationButtons={false}
          data={data}
        />
        <Separator />
        <div className="flex w-full justify-end">
          <Button
            onClick={() => router.push('new/order')}
            className="min-w-28"
            type="submit"
          >
            {'Commande'}
            <Icons.arrowRight className="ml-2 w-4 text-secondary" />
          </Button>
        </div>
      </div>
    </CustomerSearchInput>
  )
}
