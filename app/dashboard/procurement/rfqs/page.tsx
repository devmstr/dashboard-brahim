import { listRfqs } from '@/lib/procurement/actions'
import { RfqsTable } from './_components/rfqs-table'
import { getUserRole } from '@/lib/session'
import { Card } from '@/components/card'

const Page = async () => {
  const [rfqs, userRole] = await Promise.all([listRfqs(), getUserRole()])

  return (
    <Card>
      <RfqsTable data={rfqs} userRole={userRole ?? undefined} />
    </Card>
  )
}

export default Page
