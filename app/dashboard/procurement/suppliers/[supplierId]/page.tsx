import { Card } from '@/components/card'
import { getSupplierById } from '@/lib/procurement/actions'
import { notFound } from 'next/navigation'
import { SupplierForm } from '../_components/supplier.form'

interface PageProps {
  params: {
    supplierId: string
  }
}

const Page = async ({ params }: PageProps) => {
  const supplier = await getSupplierById(params.supplierId)

  if (!supplier) notFound()

  const formDefaults = {
    name: supplier.name,
    code: supplier.code ?? '',
    contactName: supplier.contactName ?? '',
    email: supplier.email ?? '',
    phone: supplier.phone ?? '',
    website: supplier.website ?? '',
    taxIdNumber: supplier.taxIdNumber ?? '',
    tradeRegisterNumber: supplier.tradeRegisterNumber ?? '',
    notes: supplier.notes ?? ''
  }

  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Fournisseur</h1>
        <p className="text-sm text-muted-foreground">
          Modifiez les informations fournisseur.
        </p>
      </div>
      <SupplierForm
        supplierId={supplier.id}
        defaultValues={formDefaults}
        submitLabel="Mettre a jour"
      />
    </Card>
  )
}

export default Page
