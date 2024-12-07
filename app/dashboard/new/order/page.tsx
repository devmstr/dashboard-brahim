import { AddComponentDialog } from '@/components/add-component.dialog'
import { Card } from '@/components/card'
import { OrderComponentsTable } from '@/components/components.table'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { NewOrderTableForm } from './new-order-table.view'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card className="pt-6 flex flex-col">
      {/* special components table view  */}
      <NewOrderTableForm />
    </Card>
  )
}

export default Page
