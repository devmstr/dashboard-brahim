import { Card } from '@/components/card'
import { listReceipts } from '@/lib/procurement/actions'
import { getUserRole } from '@/lib/session'
import { ReceiptsTable } from './_components/receipts-table'

const Page = async () => {
  const [receipts, userRole] = await Promise.all([
    listReceipts(),
    getUserRole()
  ])

  return (
    <Card>
      <ReceiptsTable data={receipts} userRole={userRole ?? undefined} />
    </Card>
  )
}

export default Page
