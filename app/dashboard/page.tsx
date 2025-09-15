import { useServerCheckRoles } from '@/hooks/useServerCheckRoles'
import { getCurrentUser, isEngineer } from '@/lib/session'
import { notFound, redirect } from 'next/navigation'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const user = await getCurrentUser()
  switch (user?.role) {
    case 'ADMIN':
      redirect('/dashboard/admin')
    case 'SALES_MANAGER':
      redirect('/dashboard/ledger')
    case 'CONSULTANT':
      redirect('/dashboard/orders')
    case 'DATA_AGENT':
      redirect('/dashboard/orders')
    case 'ENGINEERING_MANAGER':
      redirect('/dashboard/db')
    case 'PRODUCTION_MANAGER':
      redirect('/dashboard/timeline')
    case 'FINANCE_MANAGER':
      redirect('/dashboard/ledger')
    case 'INVENTORY_AGENT':
      redirect('/dashboard/inventory')
    case 'SALES_AGENT':
      redirect('/dashboard/new')
    case 'INVENTORY_AGENT':
      redirect('/dashboard/inventory')
    case 'ENGINEER':
      redirect('/dashboard/db')
    default:
      return notFound()
  }
}

export default Page
