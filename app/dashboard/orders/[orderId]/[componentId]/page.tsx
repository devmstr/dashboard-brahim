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

export const testData = [
  {
    id: 'FAX34ER7S',
    title: 'FAIS 440X470X2R TR COLL 490X50 PL',
    brand: 'CAT',
    model: 'D5',
    type: 'Faisceau',
    fabrication: 'Confection',
    quantity: 2
  },
  {
    id: 'BAR12XYZ',
    title: 'FAIS 500X530X2P TR COLL 450X55 PL',
    brand: 'CAT',
    model: 'D5',
    type: 'Faisceau',
    fabrication: 'Confection',
    quantity: 2
  },
  {
    id: 'QUX78ABC',
    title: 'FAIS 380X420X3S TR COLL 510X60 PL',
    brand: 'CAT',
    model: 'D5',
    type: 'Faisceau',
    fabrication: 'Confection',
    quantity: 2
  }
]

const getProgressMetaData = (compId: string) => {
  const comp = testData.find((component) => component.id == compId)
  if (comp) return { id: comp.id, title: comp.title }
}

const Page: React.FC<Props> = async ({ params: { componentId } }: Props) => {
  const meta = getProgressMetaData(componentId)
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
        {isProductionUser && <ComponentTechnicalForm data={undefined} />}
        {isSalesUser && <ComponentSalesForm data={undefined} />}
      </Card>
    </div>
  )
}

export default Page
