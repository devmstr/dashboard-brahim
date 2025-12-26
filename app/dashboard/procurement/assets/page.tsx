import { Card } from '@/components/card'
import { listAssets } from '@/lib/procurement/actions'
import { getUserRole } from '@/lib/session'
import { AssetsTable } from './_components/assets-table'

const Page = async () => {
  const [assets, userRole] = await Promise.all([
    listAssets(),
    getUserRole()
  ])

  return (
    <Card>
      <AssetsTable data={assets} userRole={userRole ?? undefined} />
    </Card>
  )
}

export default Page
