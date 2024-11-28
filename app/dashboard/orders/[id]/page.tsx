import { Card } from '@/components/card'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import {
  addOrderSchema,
  AddOrderSchemaType,
  InputNameType
} from '../../(timeline)/add-order.dialog'
import { DetailsOrderForm } from './details-order.form'

interface PageProps {
  params: {
    id: string
  }
}

const Page: React.FC<PageProps> = async ({ params: { id } }: PageProps) => {
  return <DetailsOrderForm />
}

export default Page
