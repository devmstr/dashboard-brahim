import { Card } from '@/components/card'
import { ProcurementTable } from '@/components/procurement-table'
import { listProcurements } from '@/lib/procurement/actions'

const Page = async () => {
  const procurements = await listProcurements()

  return (
    <Card>
      <ProcurementTable data={procurements} />
    </Card>
  )
}

export default Page
