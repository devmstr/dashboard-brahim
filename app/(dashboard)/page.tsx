import { redirect } from 'next/navigation'

interface PageProps {}

const Page: React.FC<PageProps> = ({}: PageProps) => {
  return redirect('/orders')
}

export default Page
