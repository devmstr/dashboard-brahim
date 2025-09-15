'use client'
import { Card } from '@/components/card'
import { CategoryMarginTable } from '../_components/category.table'
import { Notification } from '@/components/notification'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold ">Marge par catégorie</h2>
        <Notification variant={'information'} title="Information.">
          <p className="font-medium opacity-80">
            La marge de catégorie s’applique uniquement aux produits appartenant
            à cette catégorie. Elle s’ajoute à la marge globale et peut être
            affinée par des marges au niveau des produits ou des clients.
          </p>
          <p className="mt-1">
            Prix HT = Coût de production +
            <span className="text-blue-500 font-bold"> Marge Catégorie</span> +
            Marge Produit + Marge Client + Marge Globale
          </p>
        </Notification>
      </div>
      {/* Category Margins */}
      <CategoryMarginTable
        data={[
          { id: 'CTXG9PZ6F', category: 'Radiateurs Simple', margin: 5 },
          { id: 'CTXL3S7V2', category: 'Radiateurs Niveau 1', margin: 7 },
          { id: 'CTXR8A5J1', category: 'Radiateurs Niveau 2', margin: 10 },
          { id: 'CTXQ2K9X7', category: 'Radiateurs Niveau 3', margin: 12 },
          { id: 'CTXT4H1M8', category: 'Radiateurs Niveau 4', margin: 15 },
          { id: 'CTXB6W3D5', category: 'Radiateurs Niveau 5', margin: 17 },
          { id: 'CTXV7C9F4', category: 'Radiateurs Niveau 6', margin: 20 }
        ]}
      />
    </Card>
  )
}

export default Page
