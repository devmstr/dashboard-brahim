import { useServerCheckRoles } from '@/hooks/useServerCheckRoles'
import { notFound, redirect } from 'next/navigation'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const isUserRoleAdmin = await useServerCheckRoles('ADMIN')
  const isUserRoleSales = await useServerCheckRoles([
    'SALES_MANAGER',
    'SALES_AGENT'
  ])
  const isUserRoleProduction = await useServerCheckRoles([
    'PRODUCTION_WORKER',
    'PRODUCTION_MANAGER'
  ])
  const isUserRoleEngineer = await useServerCheckRoles([
    'ENGINEER',
    'ENGINEERING_MANAGER'
  ])
  const isInventoryAgent = await useServerCheckRoles(['INVENTORY_AGENT'])
  if (isInventoryAgent) redirect('/dashboard/inventory')
  if (isUserRoleSales) redirect('/dashboard/new')
  if (isUserRoleProduction || isUserRoleEngineer) redirect('/dashboard/orders')
  return notFound()
}

export default Page
