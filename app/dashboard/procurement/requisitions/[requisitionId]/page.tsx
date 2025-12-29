import { notFound } from 'next/navigation'
import { Card } from '@/components/card'
import {
  getRequisitionById,
  listProcurementItems,
  listProcurementServices
} from '@/lib/procurement/actions'
import { RequisitionEditForm } from '../_components/requisition.form'
interface PageProps {
  params: {
    requisitionId: string
  }
}

const Page = async ({ params }: PageProps) => {
  const [requisition, itemsOptions, servicesOptions] = await Promise.all([
    getRequisitionById(params.requisitionId),
    listProcurementItems(),
    listProcurementServices()
  ])

  if (!requisition) notFound()

  const formDefaults = {
    reference: requisition.reference,
    serviceId: requisition.serviceId ?? '',
    title: requisition.title ?? '',
    neededBy: requisition.neededBy
      ? new Date(requisition.neededBy).toISOString()
      : undefined,
    notes: requisition.notes ?? '',
    status: requisition.status,
    createdAt: requisition.createdAt.toISOString(),
    attachments:
      requisition.Attachments?.map((attachment) => ({
        id: attachment.id,
        name: attachment.name,
        uniqueName: attachment.uniqueName,
        url: attachment.url,
        type: attachment.type
      })) ?? [],
    items: requisition.Items.map((item) => ({
      itemId: item.itemId,
      itemName: item.Item?.name ?? '',
      description: item.description ?? '',
      quantity: item.quantity ?? null,
      unit: item.unit ?? '',
      estimatedUnitCost: item.estimatedUnitCost ?? null,
      currency: item.currency ?? 'DZD'
    }))
  }

  return (
    <Card className="space-y-8">
      <RequisitionEditForm
        requisitionId={requisition.id}
        defaultValues={formDefaults}
        itemsOptions={itemsOptions}
        servicesOptions={servicesOptions}
        showStatus
        submitLabel="Mettre a jour"
      />
    </Card>
  )
}

export default Page
