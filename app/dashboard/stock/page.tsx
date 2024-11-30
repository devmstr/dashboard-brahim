import { Card } from '@/components/card'
import { StockTable } from '@/components/stock-table'
import { SellCompleteProductDialog } from './sell-completes'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card className="">
      <div className="flex justify-end items-center gap-3 mb-5">
        <SellCompleteProductDialog id={''} />
      </div>
      <StockTable
        t={{
          placeholder: 'Rechercher...',
          id: 'Matricule',
          title: 'Titre',
          quantity: 'Quantity',
          price: 'Prix Unitaire',
          bulkPrice: 'Prix En Gros',
          columns: 'Colonnes',
          limit: 'Limite'
        }}
        data={[]}
      />
    </Card>
  )
}

export default Page
