import { Card } from '@/components/card'
import {
  listProcurementItems,
  listRequisitions,
  listProcurementSuppliers
} from '@/lib/procurement/actions'
import { PurchaseOrderForm } from '../_components/purchase-order.form'

const Page = async () => {
  const [itemsOptions, suppliersOptions, requisitionsOptions] =
    await Promise.all([
    listProcurementItems(),
    listProcurementSuppliers(),
    listRequisitions()
  ])

  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Nouveau bon de commande</h1>
        <p className="text-sm text-muted-foreground">
          Creez un bon de commande fournisseur.
        </p>
      </div>
      <PurchaseOrderForm
        itemsOptions={itemsOptions}
        suppliersOptions={suppliersOptions}
        requisitionsOptions={requisitionsOptions}
      />
    </Card>
  )
}

export default Page
