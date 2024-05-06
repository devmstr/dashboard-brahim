import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
interface PageProps {}

const Page: React.FC<PageProps> = async ({}: PageProps) =>
  redirect('/dashboard/timeline')

export default Page
