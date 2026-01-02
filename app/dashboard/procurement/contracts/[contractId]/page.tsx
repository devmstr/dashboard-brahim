import { Card } from '@/components/card'
import {
  getContractById,
  listProcurementServices,
  listProcurementSuppliers
} from '@/lib/procurement/actions'
import { notFound } from 'next/navigation'
import { ContractForm } from '../_components/contract.form'
import type { Attachment } from '@/lib/validations/order'

interface PageProps {
  params: {
    contractId: string
  }
}

const Page = async ({ params }: PageProps) => {
  const [contract, suppliersOptions, servicesOptions] = await Promise.all([
    getContractById(params.contractId),
    listProcurementSuppliers(),
    listProcurementServices()
  ])

  if (!contract) notFound()

  const formDefaults = {
    reference: contract.reference,
    title: contract.title ?? '',
    supplierId: contract.supplierId,
    serviceId: contract.serviceId ?? '',
    startDate: new Date(contract.startDate).toISOString(),
    endDate: contract.endDate ? new Date(contract.endDate).toISOString() : '',
    value: contract.value ?? null,
    currency: contract.currency ?? 'DZD',
    notes: contract.notes ?? '',
    attachments: contract.Attachments?.map((attachment) => ({
      id: attachment.id,
      name: attachment.name,
      uniqueName: attachment.uniqueName,
      url: attachment.url,
      type: attachment.type
    })) ?? [],
    status: contract.status
  }

  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Contrat fournisseur</h1>
        <p className="text-sm text-muted-foreground">
          Modifiez les informations du contrat.
        </p>
      </div>
      <ContractForm
        contractId={contract.id}
        defaultValues={formDefaults}
        suppliersOptions={suppliersOptions}
        servicesOptions={servicesOptions}
        showStatus
        submitLabel="Mettre a jour"
      />
    </Card>
  )
}

export default Page
