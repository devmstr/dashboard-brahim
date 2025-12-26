import { Card } from '@/components/card'
import {
  listPurchaseOrders,
  listReceipts,
  listProcurementSuppliers
} from '@/lib/procurement/actions'
import { SupplierInvoiceForm } from '../_components/supplier-invoice.form'

const Page = async () => {
  const [suppliersOptions, purchaseOrdersOptions, receiptsOptions] =
    await Promise.all([
      listProcurementSuppliers(),
      listPurchaseOrders(),
      listReceipts()
    ])

  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Nouvelle facture</h1>
        <p className="text-sm text-muted-foreground">
          Enregistrez une facture fournisseur.
        </p>
      </div>
      <SupplierInvoiceForm
        suppliersOptions={suppliersOptions}
        purchaseOrdersOptions={purchaseOrdersOptions}
        receiptsOptions={receiptsOptions}
      />
    </Card>
  )
}

export default Page
