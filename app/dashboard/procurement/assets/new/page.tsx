import { Card } from '@/components/card'
import {
  listProcurementItems,
  listProcurementSuppliers,
  listPurchaseOrders
} from '@/lib/procurement/actions'
import { AssetForm } from '../_components/asset.form'

const Page = async () => {
  const [suppliersOptions, purchaseOrdersOptions, itemsOptions] =
    await Promise.all([
      listProcurementSuppliers(),
      listPurchaseOrders(),
      listProcurementItems()
    ])

  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Nouvel actif</h1>
        <p className="text-sm text-muted-foreground">
          Creez une immobilisation fournisseur.
        </p>
      </div>
      <AssetForm
        suppliersOptions={suppliersOptions}
        purchaseOrdersOptions={purchaseOrdersOptions}
        itemsOptions={itemsOptions}
      />
    </Card>
  )
}

export default Page
