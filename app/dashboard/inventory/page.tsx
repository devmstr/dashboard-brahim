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
      {['INVENTORY_AGENT'].includes(role) && (
        <div className="flex justify-end items-center gap-3 mb-5">
          <AddInventoryItem />
        </div>
      )}
      <InventoryTable data={data} userRole={role} />
    </Card>
  )
}

export default Page
