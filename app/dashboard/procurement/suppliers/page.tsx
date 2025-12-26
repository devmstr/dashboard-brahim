import { Card } from '@/components/card'
import { listSuppliers } from '@/lib/procurement/actions'
import { getUserRole } from '@/lib/session'
import { SuppliersTable } from './_components/suppliers-table'

const Page = async () => {
  const [suppliers, userRole] = await Promise.all([
    listSuppliers(),
    getUserRole()
  ])

  return (
    <Card>
      <SuppliersTable data={suppliers} userRole={userRole ?? undefined} />
    </Card>
  )
}

export default Page
