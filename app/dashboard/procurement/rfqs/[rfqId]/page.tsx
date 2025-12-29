import { notFound } from 'next/navigation'
import { Card } from '@/components/card'
import {
  getRfqById,
  listProcurementItems,
  listProcurementServices,
  listRequisitions
} from '@/lib/procurement/actions'
import { RfqForm } from '../_components/rfq.form'
import type { Attachment } from '@/lib/validations/order'

interface PageProps {
  params: {
    rfqId: string
  }
}

const Page = async ({ params }: PageProps) => {
  const [rfq, itemsOptions, requisitionsOptions, servicesOptions] =
    await Promise.all([
    getRfqById(params.rfqId),
    listProcurementItems(),
    listRequisitions(),
    listProcurementServices()
  ])

  if (!rfq) notFound()

  const formDefaults = {
    reference: rfq.reference,
    serviceId: rfq.serviceId ?? '',
    requisitionId: rfq.requisitionId ?? '',
    neededBy: rfq.neededBy ? new Date(rfq.neededBy).toISOString() : undefined,
    notes: rfq.notes ?? '',
    status: rfq.status,
    attachments: rfq.Attachments?.map((attachment) => ({
      id: attachment.id,
      name: attachment.name,
      uniqueName: attachment.uniqueName,
      url: attachment.url,
      type: attachment.type
    })) ?? [],
    lines: rfq.Lines.map((line) => ({
      itemId: line.itemId,
      description: line.description ?? '',
      quantity: line.quantity ?? null,
      unit: line.unit ?? ''
    }))
  }

  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">RFQ</h1>
        <p className="text-sm text-muted-foreground">
          Modifiez les details du RFQ.
        </p>
      </div>
      <RfqForm
        rfqId={rfq.id}
        defaultValues={formDefaults}
        itemsOptions={itemsOptions}
        requisitionsOptions={requisitionsOptions}
        servicesOptions={servicesOptions}
        showStatus
        submitLabel="Mettre a jour"
      />
    </Card>
  )
}

export default Page
