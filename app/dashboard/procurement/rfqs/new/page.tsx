import { Card } from '@/components/card'
import {
  listProcurementItems,
  listProcurementServices,
  listRequisitions
} from '@/lib/procurement/actions'
import { RfqForm } from '../_components/rfq.form'

const Page = async () => {
  const [itemsOptions, requisitionsOptions, servicesOptions] =
    await Promise.all([
      listProcurementItems(),
      listRequisitions(),
      listProcurementServices()
    ])

  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Nouveau RFQ</h1>
        <p className="text-sm text-muted-foreground">
          Creez un appel d'offres fournisseur.
        </p>
      </div>
      <RfqForm
        itemsOptions={itemsOptions}
        requisitionsOptions={requisitionsOptions}
        servicesOptions={servicesOptions}
      />
    </Card>
  )
}

export default Page
