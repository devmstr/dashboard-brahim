import { AddInventoryItem } from '@/app/dashboard/inventory/add-new-inventory-Item.dialog'
import { Card } from '@/components/card'
import { InventoryTable } from '@/components/inventory.table'
import { getInventoryTableData } from './get-inventory-table-data'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const data = await getInventoryTableData()
  return (
    <Card className="">
      <div className="flex justify-end items-center gap-3 mb-5">
        <AddInventoryItem />
      </div>
      <InventoryTable data={data} userRole={'INVENTORY_AGENT'} />
    </Card>
  )
}

export default Page
