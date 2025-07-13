import { AddInventoryItem } from '@/app/dashboard/inventory/add-new-inventory-Item.dialog'
import { Card } from '@/components/card'
import { InventoryTable } from '@/components/inventory.table'
import { getInventoryTableData } from './get-inventory-table-data'
import { getUserRole } from '@/lib/session'
import { notFound } from 'next/navigation'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const role = await getUserRole()
  if (!role) return notFound()

  const data = await getInventoryTableData()
  return (
    <Card className="">
      <InventoryTable data={data} userRole={role}>
        {['INVENTORY_AGENT'].includes(role) && <AddInventoryItem />}
      </InventoryTable>
    </Card>
  )
}

export default Page
