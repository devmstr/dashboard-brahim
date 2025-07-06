'use client'
import { toast } from '@/hooks/use-toast'
import { skuId } from '@/lib/utils'
import { ClientSchemaType as Client } from '@/lib/validations'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ClientTable, ClientTableInput } from '@/components/client-table'
import CustomerSearchInput, {
  ClientWithAddress
} from '@/components/customer-search.input'
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
  const [customer, setCustomer] = useState<ClientWithAddress | undefined>(
    order?.Client
  )
  const router = useRouter()

  // Add an effect to keep local state in sync with order context
  useEffect(() => {
    if (order?.Client && order.Client !== customer) {
      setCustomer(order?.Client)
    }
  }, [order?.Client, customer])

  // Simple button action component
  const renderRowActions = (client: Client) => {
    return (
      <div className="px-2">
        <Button
          variant={'ghost'}
          className=""
          onClick={() => onClientChange(client)}
        >
          Choisir
        </Button>
      </div>
    )
  }

  function onClientChange(Client: ClientWithAddress | undefined) {
    setCustomer(Client)
    setOrder((prev) => ({
      ...prev,
      clientId: Client?.id,
      Client
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

    onClientChange(customer)
    // setup an order id
    setOrder((prev) => ({
      ...prev,
      id: order?.id || skuId('CO')
    }))

    router.push('new/order')

    // toast({
    //   title: 'Étape 1 : Client enregistré',
    //   description:
    //     'Les informations du client ont été enregistrées avec succès.',
    //   variant: 'success'
    // })

    return
  }

  return (
    <CustomerSearchInput selected={customer} onSelectChange={onClientChange}>
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
