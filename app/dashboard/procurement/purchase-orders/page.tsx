import { listPurchaseOrders } from '@/lib/procurement/actions'
import { PurchaseOrdersTable } from './_components/purchase-orders-table'
import { Card } from '@/components/card'
import { getUserRole } from '@/lib/session'

const Page = async () => {
  const [purchaseOrders, userRole] = await Promise.all([
    listPurchaseOrders(),
    getUserRole()
  ])

  return (
    <Card>
      <PurchaseOrdersTable
        data={purchaseOrders}
        userRole={userRole ?? undefined}
      />
    </Card>
  )
}

export default Page
