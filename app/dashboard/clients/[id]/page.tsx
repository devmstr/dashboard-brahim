import { Card } from '@/components/card'
// import { OneClientForm } from './one-client.form'
import db from '@/lib/db'
import { notFound } from 'next/navigation'

interface Props {
  params: { id: string }
}

const Page: React.FC<Props> = async ({ params }: Props) => {
  const client = await db.client.findUnique({
    where: {
      id: params.id
    },
    include: {
      _count: {
        select: { Orders: true }
      }
    }
  })
  if (!client) return notFound()
  return <Card>{/* <OneClientForm data={client} /> */}</Card>
}

export default Page
