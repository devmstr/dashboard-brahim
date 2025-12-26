import { Card } from '@/components/card'
import {
  listProcurementItems,
  listPurchaseOrders
} from '@/lib/procurement/actions'
import { ReceiptForm } from '../_components/receipt.form'

const Page = async () => {
  const [itemsOptions, purchaseOrdersOptions] = await Promise.all([
    listProcurementItems(),
    listPurchaseOrders()
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
      />
    </Card>
  )
}

export default Page
