import { Card } from '@/components/card'

interface Props {
  params: { componentId: string }
}

const Page: React.FC<Props> = ({ params: { componentId } }: Props) => {
  return (
    <Card>
      <h1>{componentId}</h1>
    </Card>
  )
}

export default Page
