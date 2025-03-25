import { Card } from '@/components/card'
import { ComponentTechnicalForm } from './component.technical.form'
import { ComponentSalesForm } from './component.sales.form'
import { CoreProgressTracker } from '@/components/core-progress-tracker'
import { useServerCheckRoles } from '@/hooks/useServerCheckRoles'

interface Props {
  params: {
    orderId: string
    componentId: string
  }
}

import data from './data.json'
import { ComponentProductionForm } from './component.production.form'
import { WorkstationTracker } from '@/components/workstation-tracker'
const getFakeOrderMetaData = (compId: string) => {
  const comp = data.find((component) => component.id == compId)
  if (comp) return { id: comp.id, title: comp.title }
}

const Page: React.FC<Props> = async ({ params: { componentId } }: Props) => {
  const meta = getFakeOrderMetaData(componentId)
  const isProductionUser = await useServerCheckRoles('PRODUCTION')
  const isSalesUser = await useServerCheckRoles('SALES')
  const isEngineerUser = await useServerCheckRoles('ENGINEER')

  return (
    <div className="space-y-4">
      {(isProductionUser || isEngineerUser) && (
        <Card>
          <CoreProgressTracker data={meta} />
        </Card>
      )}

      <Card>
        {isEngineerUser && <ComponentTechnicalForm data={undefined} />}
        {isProductionUser && <ComponentProductionForm data={undefined} />}
        {isSalesUser && <ComponentSalesForm data={undefined} />}
      </Card>
    </div>
  )
}

export default Page
