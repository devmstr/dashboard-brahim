import { Card } from '@/components/card'
import { listContracts } from '@/lib/procurement/actions'
import { getUserRole } from '@/lib/session'
import { ContractsTable } from './_components/contracts-table'

const Page = async () => {
  const [contracts, userRole] = await Promise.all([
    listContracts(),
    getUserRole()
  ])

  return (
    <Card>
      <ContractsTable data={contracts} userRole={userRole ?? undefined} />
    </Card>
  )
}

export default Page
