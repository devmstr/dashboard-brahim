import { Card } from '@/components/card'
import {
  listProcurementItems,
  listProcurementServices,
  listProcurementSuppliers,
  listPurchaseOrders
} from '@/lib/procurement/actions'
import { generateId } from '@/helpers/id-generator'
import { AssetForm } from '../_components/asset.form'

const Page = async () => {
  const [
    suppliersOptions,
    purchaseOrdersOptions,
    itemsOptions,
    servicesOptions
  ] = await Promise.all([
    listProcurementSuppliers(),
    listPurchaseOrders(),
    listProcurementItems(),
    listProcurementServices()
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
        defaultValues={{ reference: generateId('AS') }}
        suppliersOptions={suppliersOptions}
        purchaseOrdersOptions={purchaseOrdersOptions}
        itemsOptions={itemsOptions}
        servicesOptions={servicesOptions}
      />
    </Card>
  )
}

export default Page
