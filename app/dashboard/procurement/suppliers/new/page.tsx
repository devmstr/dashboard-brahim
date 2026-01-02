import { Card } from '@/components/card'
import { generateId } from '@/helpers/id-generator'
import { SupplierForm } from '../_components/supplier.form'

const Page = async () => {
  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Nouveau fournisseur</h1>
        <p className="text-sm text-muted-foreground">
          Creez un nouveau fournisseur.
        </p>
      </div>
      <SupplierForm
        defaultValues={{
          code: generateId('SU')
        }}
      />
    </Card>
  )
}

export default Page
