import { Card } from '@/components/card'
import { ProcurementTable } from '@/components/procurement-table'
import { getProcurements } from '@/lib/mock/procurements'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const procurements = await getProcurements()

  return (
    <Card>
      <ProcurementTable data={procurements} />
    </Card>
  )
}

export default Page
