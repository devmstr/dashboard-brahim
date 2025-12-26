import { Card } from '@/components/card'
import { listItems } from '@/lib/procurement/actions'
import { getUserRole } from '@/lib/session'
import { ItemsTable } from './_components/items-table'

const Page = async () => {
  const [items, userRole] = await Promise.all([listItems(), getUserRole()])

  return (
    <Card>
      <ItemsTable data={items} userRole={userRole ?? undefined} />
    </Card>
  )
}

export default Page
