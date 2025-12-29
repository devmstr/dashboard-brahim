import { Card } from '@/components/card'
import {
  getSupplierInvoiceById,
  listProcurementServices,
  listPurchaseOrders,
  listReceipts,
  listProcurementSuppliers
} from '@/lib/procurement/actions'
import { notFound } from 'next/navigation'
import { SupplierInvoiceForm } from '../_components/supplier-invoice.form'
import type { Attachment } from '@/lib/validations/order'

interface PageProps {
  params: {
    invoiceId: string
  }
}

const Page = async ({ params }: PageProps) => {
  const [
    invoice,
    suppliersOptions,
    purchaseOrdersOptions,
    receiptsOptions,
    servicesOptions
  ] = await Promise.all([
    getSupplierInvoiceById(params.invoiceId),
    listProcurementSuppliers(),
    listPurchaseOrders(),
    listReceipts(),
    listProcurementServices()
  ])

  if (!invoice) notFound()

  const formDefaults = {
    reference: invoice.reference,
    supplierId: invoice.supplierId,
    serviceId: invoice.serviceId ?? '',
    purchaseOrderId: invoice.purchaseOrderId ?? '',
    receiptId: invoice.receiptId ?? '',
    invoiceDate: invoice.invoiceDate
      ? new Date(invoice.invoiceDate).toISOString()
      : undefined,
    dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString() : undefined,
    paidAt: invoice.paidAt ? new Date(invoice.paidAt).toISOString() : undefined,
    currency: invoice.currency ?? 'DZD',
    subtotal: invoice.subtotal ?? null,
    taxes: invoice.taxes ?? null,
    total: invoice.total ?? null,
    notes: invoice.notes ?? '',
    attachments: invoice.Attachments?.map((attachment) => ({
      id: attachment.id,
      name: attachment.name,
      uniqueName: attachment.uniqueName,
      url: attachment.url,
      type: attachment.type
    })) ?? [],
    status: invoice.status
  }

  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Facture fournisseur</h1>
        <p className="text-sm text-muted-foreground">
          Modifiez les informations de la facture.
        </p>
      </div>
      <SupplierInvoiceForm
        invoiceId={invoice.id}
        defaultValues={formDefaults}
        suppliersOptions={suppliersOptions}
        purchaseOrdersOptions={purchaseOrdersOptions}
        receiptsOptions={receiptsOptions}
        servicesOptions={servicesOptions}
        showStatus
        submitLabel="Mettre a jour"
      />
    </Card>
  )
}

export default Page
