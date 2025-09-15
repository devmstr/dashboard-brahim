import { Card } from '@/components/card'
import { ProductMarginTable } from '../_components/product-magring'
import { Notification } from '@/components/notification'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold ">Marge par produit</h2>
        <Notification variant={'information'} title="Information.">
          <p className="font-medium opacity-80">
            La marge produit s’applique uniquement à ce produit spécifique. Elle
            prime sur la marge globale et, le cas échéant, sur la marge de
            catégorie.
          </p>
          <p className="mt-1">
            Prix HT = Coût de production + Marge Catégorie +
            <span className="text-blue-500 font-bold"> Marge Produit </span> +
            Marge Client + Marge Globale
          </p>
        </Notification>
      </div>
      {/* Radiator/Product Table (your existing one) */}
      <ProductMarginTable
        data={[
          {
            id: 'FEX112L3U',
            label: 'RAD 0480X0590 5DM 10 0600X0130 PC',
            margin: {
              type: 'percentage',
              value: 3
            },
            brand: 'Toyota',
            model: 'Yaris',
            type: '1.4 D-4D 90 cv',
            createdAt: ''
          }
        ]}
      />
    </Card>
  )
}

export default Page
