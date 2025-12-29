import { Card } from '@/components/card'
import {
  listProcurementItems,
  listProcurementServices,
  listPurchaseOrders
} from '@/lib/procurement/actions'
import { ReceiptForm } from '../_components/receipt.form'

const Page = async () => {
  const [itemsOptions, purchaseOrdersOptions, servicesOptions] =
    await Promise.all([
      listProcurementItems(),
      listPurchaseOrders(),
      listProcurementServices()
    ])

  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Nouveau recu</h1>
        <p className="text-sm text-muted-foreground">
          Enregistrez une reception fournisseur.
        </p>
      </div>
      <ReceiptForm
        itemsOptions={itemsOptions}
        purchaseOrdersOptions={purchaseOrdersOptions}
        servicesOptions={servicesOptions}
      />
    </Card>
  )
}

export default Page
