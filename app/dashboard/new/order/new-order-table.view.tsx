'use client'

import { AddComponentDialog } from '@/components/add-component.dialog'
import { OrderComponentsTable } from '@/components/components.table'
import { useOrder } from '@/components/new-order.provider'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'

interface Props {}

export const NewOrderTableForm: React.FC<Props> = ({}: Props) => {
  const router = useRouter()
  const orderContext = useOrder()
  return (
    <div>
      <OrderComponentsTable
        className="rounded-b-none border-b-0"
        orderContext={orderContext}
        t={{
          id: 'Matricule',
          title: 'Titre',
          brand: 'Marque',
          model: 'Model',
          type: 'Commande',
          fabrication: 'Fabrication',
          quantity: 'Quantité'
        }}
      />
      <div className="flex flex-grow justify-center items-center h-full">
        <AddComponentDialog className="flex w-full justify-start gap-1  text-muted-foreground rounded-none rounded-b-md border-muted-foreground/30  bg-gray-100 text-md border-dashed broder-dash py-6" />
      </div>
      <div className="pt-6 flex flex-col items-end gap-4">
        <Separator />
        <div className="w-full flex justify-between">
          <Button
            onClick={() => router.push('/dashboard/new')}
            className={'w-24'}
            type="submit"
          >
            {'Précédent'}
          </Button>
          <Button onClick={() => router.push('payment')} className={'w-24'}>
            {'Suivant'}
          </Button>
        </div>
      </div>
    </div>
  )
}
