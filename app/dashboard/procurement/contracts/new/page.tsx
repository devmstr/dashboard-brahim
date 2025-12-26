import { Card } from '@/components/card'
import { listProcurementSuppliers } from '@/lib/procurement/actions'
import { ContractForm } from '../_components/contract.form'

const Page = async () => {
  const suppliersOptions = await listProcurementSuppliers()

  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Nouveau contrat</h1>
        <p className="text-sm text-muted-foreground">
          Creez un contrat fournisseur.
        </p>
      </div>
      <ContractForm suppliersOptions={suppliersOptions} />
    </Card>
  )
}

export default Page
