import { OrderComponentsTable } from '@/components/components.table'
import { OrderMetaForm } from './_components/order-meta.form'
import { Card } from '@/components/card'

interface PageProps {
  params: {
    id: string
  }
}

const Page: React.FC<PageProps> = async ({ params: { id } }: PageProps) => {
  return (
    <div className="space-y-4">
      <Card className="">
        <OrderMetaForm data={{ id: 'PAX3L6M34' }} />
      </Card>
      <Card>
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
      </Card>
    </div>
  )
}

export default Page
