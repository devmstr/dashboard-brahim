'use client'
import { AddOrderSchemaType } from '@/app/dashboard/timeline/add-order.dialog'
import { COMPANY_LABELS_TYPE } from '@/config/global'
import { clientValidationSchema, ClientValidationType } from '@/lib/validations'
import { ClientTableEntry, Customer } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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

interface Props {
  data: ClientValidationType[]
}

export const ClientForm: React.FC<Props> = ({ data }: Props) => {
  const { order, setOrder } = useOrder()
  const [customer, setCustomer] = useState<ClientValidationType | undefined>(
    order?.client
  )
  const router = useRouter()

  // Add an effect to keep local state in sync with order context
  useEffect(() => {
    if (order?.client && order.client !== customer) {
      setCustomer(order.client)
    }
  }, [order?.client, customer])

  // Simple button action component
  const renderRowActions = (client: ClientValidationType) => {
    return (
      <Button
        variant={'outline'}
        onClick={() => {
          console.log('Full row data:', client)
          setCustomer(client)
          setOrder((prev) => ({
            ...prev,
            client
          }))
        }}
      >
        Choisir
      </Button>
    )
  }

  return (
    <CustomerSearchInput
      selected={customer}
      onSelectChange={(client: ClientWithOrdersCount | undefined) => {
        setCustomer(client)
        setOrder((prev) => ({
          ...prev,
          client: client
        }))
      }}
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
