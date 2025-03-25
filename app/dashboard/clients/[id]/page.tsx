import { Card } from '@/components/card'
import { OneClientForm } from './one-client.form'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card>
      <OneClientForm
        data={{
          isCompany: true
        }}
      />
    </Card>
  )
}

export default Page
