import { Card } from '@/components/card'
import { NewOrderTableForm } from './new-order-table.view'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card className="pt-6 flex flex-col max-w-6xl mx-auto">
      {/* special components table view  */}
      <NewOrderTableForm />
    </Card>
  )
}

export default Page
