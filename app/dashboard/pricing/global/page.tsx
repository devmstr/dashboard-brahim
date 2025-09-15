import { ClientTable } from '@/components/client-table'
import { CategoryMarginTable } from '../_components/category.table'
import { GlobalMarginCard } from '../_components/global-margin.card'
import { DatabaseTable } from '../../db/database-table'
import { Card } from '@/components/card'
import { Notification } from '@/components/notification'

export default function Page() {
  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold ">Marge Globale</h2>
        <Notification variant={'warning'} title="Attention!">
          <p className="font-medium opacity-80">
            La marge globale s’applique automatiquement à tous les produits.
            Vous pouvez ensuite la modifier ou la compléter par des marges
            spécifiques sur les catégories, les produits ou les clients.
          </p>
          <p className="mt-1">
            Prix HT = Coût de production + Marge Catégorie + Marge Produit +
            Marge Client +
            <span className="text-yellow-500 font-bold"> Marge Globale </span>
          </p>
        </Notification>
      </div>
      <GlobalMarginCard defaultMargin={12} />
    </Card>
  )
}
