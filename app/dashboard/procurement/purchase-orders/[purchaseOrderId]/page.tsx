import { notFound } from 'next/navigation'
import { Card } from '@/components/card'
import {
  getPurchaseOrderById,
  listProcurementItems,
  listRequisitions,
  listProcurementSuppliers
} from '@/lib/procurement/actions'
import { PurchaseOrderForm } from '../_components/purchase-order.form'
import type { Attachment } from '@/lib/validations/order'

interface PageProps {
  params: {
    purchaseOrderId: string
  }
}

const Page = async ({ params }: PageProps) => {
  const [purchaseOrder, itemsOptions, suppliersOptions, requisitionsOptions] =
    await Promise.all([
      getPurchaseOrderById(params.purchaseOrderId),
      listProcurementItems(),
      listProcurementSuppliers(),
      listRequisitions()
    ])

  if (!purchaseOrder) notFound()

  const formDefaults = {
    reference: purchaseOrder.reference,
    supplierId: purchaseOrder.supplierId ?? null,
    requisitionId: purchaseOrder.requisitionId ?? '',
    rfqId: purchaseOrder.rfqId ?? '',
    vendor: purchaseOrder.vendor ?? '',
    contactName: purchaseOrder.contactName ?? '',
    contactEmail: purchaseOrder.contactEmail ?? '',
    phone: purchaseOrder.phone ?? '',
    currency: purchaseOrder.currency ?? 'DZD',
    expectedDate: purchaseOrder.expectedDate
      ? new Date(purchaseOrder.expectedDate).toISOString()
      : undefined,
    paymentTerms: purchaseOrder.paymentTerms ?? '',
    notes: purchaseOrder.notes ?? '',
    status: purchaseOrder.status,
    attachments:
      purchaseOrder.Attachments?.map((attachment) => ({
        id: attachment.id,
        name: attachment.name,
        uniqueName: attachment.uniqueName,
        url: attachment.url,
        type: attachment.type
      })) ?? [],
    items: purchaseOrder.Items.map((item) => ({
      itemId: item.itemId,
      description: item.description ?? '',
      quantity: item.quantity ?? null,
      unit: item.unit ?? '',
      unitPrice: item.unitPrice ?? null,
      total: item.total ?? null
    }))
  }

  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Bon de commande</h1>
        <p className="text-sm text-muted-foreground">
          Modifiez les details du bon de commande.
        </p>
      </div>
      <PurchaseOrderForm
        purchaseOrderId={purchaseOrder.id}
        defaultValues={formDefaults}
        itemsOptions={itemsOptions}
        suppliersOptions={suppliersOptions}
        requisitionsOptions={requisitionsOptions}
        showStatus
        submitLabel="Mettre a jour"
      />
    </Card>
  )
}

export default Page
