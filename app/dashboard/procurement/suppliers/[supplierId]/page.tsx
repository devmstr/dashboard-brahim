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

  const { Address, ...supplierRecord } = supplier
  const formDefaults = {
    name: supplierRecord.name,
    code: supplierRecord.code ?? '',
    category: supplierRecord.category ?? '',
    contactName: supplierRecord.contactName ?? '',
    email: supplierRecord.email ?? '',
    phone: supplierRecord.phone ?? '',
    website: supplierRecord.website ?? '',
    fiscalNumber: supplierRecord.fiscalNumber ?? '',
    taxIdNumber: supplierRecord.taxIdNumber ?? '',
    registrationArticle: supplierRecord.registrationArticle ?? '',
    statisticalIdNumber: supplierRecord.statisticalIdNumber ?? '',
    tradeRegisterNumber: supplierRecord.tradeRegisterNumber ?? '',
    approvalNumber: supplierRecord.approvalNumber ?? '',
    notes: supplierRecord.notes ?? '',
    ...(Address && {
      addressId: Address.id ?? undefined,
      street: Address.street ?? undefined,
      cityId: Address.cityId ?? undefined,
      provinceId: Address.provinceId ?? undefined,
      countryId: Address.countryId ?? undefined,
      country: Address.Country?.name ?? undefined,
      province: Address.Province?.name ?? undefined,
      city: Address.City?.name ?? undefined,
      zip: Address.City?.zipCode ?? undefined
    })
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
