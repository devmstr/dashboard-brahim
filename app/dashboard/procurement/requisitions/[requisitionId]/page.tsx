import { notFound } from 'next/navigation'
import { Card } from '@/components/card'
import {
  getRequisitionById,
  listProcurementItems
} from '@/lib/procurement/actions'
import { RequisitionForm } from '../_components/requisition.form'
import type { Attachment } from '@/lib/validations/order'

interface PageProps {
  params: {
    requisitionId: string
  }
}

const Page = async ({ params }: PageProps) => {
  const [requisition, itemsOptions] = await Promise.all([
    getRequisitionById(params.requisitionId),
    listProcurementItems()
  ])

  if (!requisition) notFound()

  const formDefaults = {
    reference: requisition.reference,
    title: requisition.title ?? '',
    neededBy: requisition.neededBy
      ? new Date(requisition.neededBy).toISOString()
      : undefined,
    notes: requisition.notes ?? '',
    status: requisition.status,
    attachments: requisition.Attachments?.map((attachment) => ({
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
      <RequisitionForm
        requisitionId={requisition.id}
        defaultValues={formDefaults}
        itemsOptions={itemsOptions}
        showStatus
        submitLabel="Mettre a jour"
      />
    </Card>
  )
}

export default Page
