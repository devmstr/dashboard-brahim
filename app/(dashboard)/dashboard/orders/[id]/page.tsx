import { Card } from '@/components/card'
import jsonData from '../../timeline/data.json'
import { EditOrderForm } from './edit-order-form'

interface PageProps {
  params: {
    id: string
  }
}

const fetchData = async (id: string) => {
  return jsonData.find((item) => item.id === id)
}

const Page: React.FC<PageProps> = async ({ params: { id } }: PageProps) => {
  const data = await fetchData(id)
  return (
    <Card>
      <EditOrderForm data={data} />
    </Card>
  )
}

export default Page
