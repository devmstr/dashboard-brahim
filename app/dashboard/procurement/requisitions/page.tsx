import { listRequisitions } from '@/lib/procurement/actions'
import { RequisitionsTable } from './_components/requisitions-table'
import { Card } from '@/components/card'
import { getUserRole } from '@/lib/session'

const Page = async () => {
  const [requisitions, userRole] = await Promise.all([
    listRequisitions(),
    getUserRole()
  ])

  return (
    <Card>
      <RequisitionsTable data={requisitions} userRole={userRole ?? undefined} />
    </Card>
  )
}

export default Page
