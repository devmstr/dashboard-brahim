'use client'
import { toast } from '@/hooks/use-toast'
import { skuId } from '@/lib/utils'
import { Client } from '@/lib/validations'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ClientTable, ClientTableInput } from '@/components/client-table'
import CustomerSearchInput from '@/components/customer-search.input'
import { Icons } from '@/components/icons'
import { useOrder } from '@/components/new-order.provider'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

interface Props {
  data: ClientTableInput[]
}

export const ClientForm: React.FC<Props> = ({ data }: Props) => {
  const { order, setOrder } = useOrder()
  const [customer, setCustomer] = useState<Client | undefined>(order?.Client)
  const router = useRouter()

  // Add an effect to keep local state in sync with order context
  useEffect(() => {
    if (order?.Client && order.Client !== customer) {
      setCustomer(order.Client)
    }
  }, [order?.Client, customer])

  // Simple button action component
  const renderRowActions = (client: Client) => {
    return (
      <div className="px-2">
        <Button variant={'ghost'} className="" onClick={() => onSubmit(client)}>
          Choisir
        </Button>
      </div>
    )
  }

  function onSubmit(client: ClientTableInput | undefined) {
    setCustomer(client)
    setOrder((prev) => ({
      ...prev,
      clientId: client?.id,
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
    // setup an order id
    const orderId = skuId('CO')
    setOrder((prev) => ({
      ...prev,
      id: orderId
    }))

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
