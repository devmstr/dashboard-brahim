import { Card } from '@/components/card'
import {
  listProcurementItems,
  listProcurementServices,
  listRequisitions,
  listProcurementSuppliers
} from '@/lib/procurement/actions'
import { generateId } from '@/helpers/id-generator'
import { PurchaseOrderForm } from '../_components/purchase-order.form'

const Page = async () => {
  const [
    itemsOptions,
    suppliersOptions,
    requisitionsOptions,
    servicesOptions
  ] = await Promise.all([
    listProcurementItems(),
    listProcurementSuppliers(),
    listRequisitions(),
    listProcurementServices()
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
        defaultValues={{ reference: generateId('PO') }}
        itemsOptions={itemsOptions}
        suppliersOptions={suppliersOptions}
        requisitionsOptions={requisitionsOptions}
        servicesOptions={servicesOptions}
      />
    </Card>
  )
}

export default Page
