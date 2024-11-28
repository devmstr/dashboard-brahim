import { Card } from '@/components/card'
import { PartialsTable } from '@/components/partials-table'
import { SellCompleteProductDialog } from '../completes/sell-completes'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card className="">
      <div className="flex justify-end items-center gap-3">
        <SellCompleteProductDialog id={''} />
      </div>
      <PartialsTable data={[]} />
    </Card>
  )
}

export default Page
