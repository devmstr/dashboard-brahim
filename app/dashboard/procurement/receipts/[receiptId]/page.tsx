import { Card } from '@/components/card'
import {
  getReceiptById,
  listProcurementItems,
  listProcurementServices,
  listPurchaseOrders
} from '@/lib/procurement/actions'
import { notFound } from 'next/navigation'
import { ReceiptForm } from '../_components/receipt.form'
import type { Attachment } from '@/lib/validations/order'

interface PageProps {
  params: {
    receiptId: string
  }
}

const Page = async ({ params }: PageProps) => {
  const [receipt, itemsOptions, purchaseOrdersOptions, servicesOptions] =
    await Promise.all([
      getReceiptById(params.receiptId),
      listProcurementItems(),
      listPurchaseOrders(),
      listProcurementServices()
    ])

  if (!receipt) notFound()

  const formDefaults = {
    reference: receipt.reference,
    purchaseOrderId: receipt.purchaseOrderId ?? '',
    serviceId: receipt.serviceId ?? '',
    receivedAt: receipt.receivedAt
      ? new Date(receipt.receivedAt).toISOString()
      : undefined,
    notes: receipt.notes ?? '',
    status: receipt.status,
    attachments: receipt.Attachments?.map((attachment) => ({
      id: attachment.id,
      name: attachment.name,
      uniqueName: attachment.uniqueName,
      url: attachment.url,
      type: attachment.type
    })) ?? [],
    items: receipt.Items.map((item) => ({
      purchaseOrderItemId: item.purchaseOrderItemId,
      itemId: item.itemId,
      quantityReceived: item.quantityReceived ?? null,
      condition: item.condition ?? '',
      notes: item.notes ?? ''
    }))
  }

  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Recu fournisseur</h1>
        <p className="text-sm text-muted-foreground">
          Modifiez les informations de reception.
        </p>
      </div>
      <ReceiptForm
        receiptId={receipt.id}
        defaultValues={formDefaults}
        itemsOptions={itemsOptions}
        purchaseOrdersOptions={purchaseOrdersOptions}
        servicesOptions={servicesOptions}
        showStatus
        submitLabel="Mettre a jour"
      />
    </Card>
  )
}

export default Page
