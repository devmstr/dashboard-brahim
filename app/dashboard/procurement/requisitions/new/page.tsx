import { Card } from '@/components/card'
import { listProcurementItems } from '@/lib/procurement/actions'
import { RequisitionForm } from '../_components/requisition.form'

const Page = async () => {
  const itemsOptions = await listProcurementItems()

  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Nouvelle demande d'achat</h1>
        <p className="text-sm text-muted-foreground">
          Creez une demande d'achat avec ses articles.
        </p>
      </div>
      <RequisitionForm itemsOptions={itemsOptions} />
    </Card>
  )
}

export default Page
