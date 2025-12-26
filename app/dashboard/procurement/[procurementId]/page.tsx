import { redirect } from 'next/navigation'

interface PageProps {
  params: {
    procurementId: string
  }
}

const Page: React.FC<PageProps> = async ({ params: { procurementId } }) => {
  redirect(`/dashboard/procurement/purchase-orders/${procurementId}`)
}

export default Page
