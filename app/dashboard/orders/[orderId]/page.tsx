import { OrderComponentsTable } from '@/components/components.table'
import { OrderMetaForm } from './_components/order-meta.form'
import { Card } from '@/components/card'

interface PageProps {
  params: {
    orderId: string
  }
}

const Page: React.FC<PageProps> = async ({
  params: { orderId }
}: PageProps) => {
  return (
    <div className="space-y-4">
      <Card className="">
        <OrderMetaForm data={{ id: orderId }} />
      </Card>
      <Card className="">
        <div className="flex items-center justify-between select-none">
          <span className="absolute top-0 left-6 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            articles
          </span>
        </div>
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
          data={[
            {
              id: 'FAXDE34T3',
              title: 'FAIS 440X470X2R TR COLL 490X50 PL',
              brand: 'CAT',
              model: 'D5',
              type: 'Faisceau',
              fabrication: 'Confection',
              quantity: 2
            }
          ]}
        />
      </Card>
    </div>
  )
}

export default Page
