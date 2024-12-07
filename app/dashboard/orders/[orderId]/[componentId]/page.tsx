import { Card } from '@/components/card'
import { ComponentForm } from './component.form'

interface Props {
  params: {
    orderId: string
    componentId: string
  }
}

const Page: React.FC<Props> = ({ params: { componentId } }: Props) => {
  return (
    <Card>
      <ComponentForm data={undefined} />
    </Card>
  )
}

export default Page
