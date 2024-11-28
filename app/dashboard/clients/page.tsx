import { Card } from '@/components/card'
import { ClientTable } from '@/components/client-table'
import { AddClientDialog } from './add-client.dialog'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card className="">
      <div className="flex justify-end items-center gap-3">
        <AddClientDialog id={''} />
      </div>
      <ClientTable data={[]} />
    </Card>
  )
}

export default Page
