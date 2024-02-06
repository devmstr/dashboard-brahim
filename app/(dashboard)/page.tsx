import { redirect } from 'next/navigation'

interface PageProps {}

const Page: React.FC<PageProps> = ({}: PageProps) => {
  return redirect('/dashboard/orders')
}

export default Page
