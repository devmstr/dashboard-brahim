import { AddComponentDialog } from '@/components/add-component.dialog'
import { Card } from '@/components/card'
import { OrderComponentsTable } from '@/components/components.table'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card className="pt-6 flex flex-col">
      <OrderComponentsTable
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
          <Link
            href={'/dashboard/new'}
            className={cn(buttonVariants({ variant: 'default' }), 'w-24')}
            type="submit"
          >
            {'Précédent'}
          </Link>
          <Link
            href={'/dashboard/new/payment'}
            className={cn(buttonVariants({ variant: 'default' }), 'w-24')}
          >
            {'Suivant'}
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default Page
