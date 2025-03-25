import { AddInventoryItem } from '@/app/dashboard/inventory/add-new-inventory-Item.dialog'
import { Card } from '@/components/card'
import { InventoryTable } from '@/components/inventory.table'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card className="">
      <div className="flex justify-end items-center gap-3 mb-5">
        <AddInventoryItem />
      </div>
      <InventoryTable
        data={[
          {
            id: 'RAX5H7MNT',
            designation: 'RA 0530X0540 4D7 10 0545X085 PC KOMATSU FD60',
            barcode: '6137045654432',
            quantity: 2,
            price: 105000,
            bulkPrice: 95000,
            bulkPriceThreshold: 10
          }
        ]}
        userRole={'INVENTORY_AGENT'}
      />
    </Card>
  )
}

export default Page
