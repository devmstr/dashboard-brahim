import { Card } from '@/components/card'
import { getUser } from '@/lib/session'
import { notFound, redirect } from 'next/navigation'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const user = await getUser()
  if (user?.role !== 'ADMIN') redirect('/dashboard/timeline')
  return notFound()
}

export default Page
