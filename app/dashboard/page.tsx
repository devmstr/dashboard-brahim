import { Card } from '@/components/card'
import { useServerUser } from '@/hooks/useServerUser'
import { notFound, redirect } from 'next/navigation'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const user = await useServerUser()
  if (user?.role !== 'ADMIN') redirect('/dashboard/new')
  return notFound()
}

export default Page
