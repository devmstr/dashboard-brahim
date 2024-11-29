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
