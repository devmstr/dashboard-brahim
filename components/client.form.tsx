'use client'
import { AddOrderSchemaType } from '@/app/dashboard/timeline/add-order.dialog'
import { COMPANY_LABELS_TYPE } from '@/config/global'
import {
  ClientType,
  clientValidationSchema,
  ClientValidationType
} from '@/lib/validations'
import { ClientTableEntry, Customer } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ClientTable } from './client-table'
import { Icons } from './icons'
import { useOrder } from './new-order.provider'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import CustomerSearchInput from './customer-search.input'
import { skuId } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

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
      <div className="px-2">
        <Button variant={'ghost'} className="" onClick={() => onSubmit(client)}>
          Choisir
        </Button>
      </div>
    )
  }

  function onSubmit(client: ClientType | undefined) {
    setCustomer(client)
    setOrder((prev) => ({
      ...prev,
      client
    }))
  }

  function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (!customer) {
      toast({
        title: 'Missing Customer',
        description: 'You have to select a customer first',
        variant: 'destructive'
      })
      return
    }

    onSubmit(customer)

    router.push('new/order')
    return
  }

  return (
    <CustomerSearchInput selected={customer} onSelectChange={onSubmit}>
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
          <Button onClick={handleSubmit} className="min-w-28" type="submit">
            {'Commande'}
            <Icons.arrowRight className="ml-2 w-4 text-secondary" />
          </Button>
        </div>
      </div>
    </CustomerSearchInput>
  )
}
