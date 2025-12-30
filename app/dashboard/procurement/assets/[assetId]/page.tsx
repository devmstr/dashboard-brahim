import { Card } from '@/components/card'
import {
  getAssetById,
  listProcurementItems,
  listProcurementServices,
  listProcurementSuppliers,
  listPurchaseOrders
} from '@/lib/procurement/actions'
import { notFound } from 'next/navigation'
import { AssetForm } from '../_components/asset.form'
import type { Attachment } from '@/lib/procurement/validations/order'

interface PageProps {
  params: {
    assetId: string
  }
}

const Page = async ({ params }: PageProps) => {
  const [
    asset,
    suppliersOptions,
    purchaseOrdersOptions,
    itemsOptions,
    servicesOptions
  ] = await Promise.all([
    getAssetById(params.assetId),
    listProcurementSuppliers(),
    listPurchaseOrders(),
    listProcurementItems(),
    listProcurementServices()
  ])

  if (!asset) notFound()

  const formDefaults = {
    reference: asset.reference,
    name: asset.name,
    serviceId: asset.serviceId ?? '',
    supplierId: asset.supplierId ?? '',
    purchaseOrderId: asset.purchaseOrderId ?? '',
    itemId: asset.itemId ?? '',
    acquisitionDate: asset.acquisitionDate
      ? new Date(asset.acquisitionDate).toISOString()
      : undefined,
    value: asset.value ?? null,
    currency: asset.currency ?? 'DZD',
    notes: asset.notes ?? '',
    attachments:
      asset.Attachments?.map((attachment) => ({
        id: attachment.id,
        name: attachment.name,
        uniqueName: attachment.uniqueName,
        url: attachment.url,
        type: attachment.type
      })) ?? [],
    status: asset.status
  }

  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Immobilisation</h1>
        <p className="text-sm text-muted-foreground">
          Modifiez les informations de l'actif.
        </p>
      </div>
      <AssetForm
        assetId={asset.id}
        defaultValues={formDefaults}
        suppliersOptions={suppliersOptions}
        purchaseOrdersOptions={purchaseOrdersOptions}
        itemsOptions={itemsOptions}
        servicesOptions={servicesOptions}
        showStatus
        submitLabel="Mettre a jour"
      />
    </Card>
  )
}

export default Page
