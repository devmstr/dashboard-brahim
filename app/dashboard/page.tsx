import { useServerCheckRoles } from '@/hooks/useServerCheckRoles'
import { isEngineer } from '@/lib/session'
import { notFound, redirect } from 'next/navigation'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const isUserRoleAdmin = await useServerCheckRoles('ADMIN')
  const isUserRoleFinance = await useServerCheckRoles([
    'FINANCE',
    'FINANCE_MANAGER'
  ])

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
    'ENGINEERING_MANAGER',
    'CONSULTANT'
  ])
  const isInventoryAgent = await useServerCheckRoles(['INVENTORY_AGENT'])
  if (isInventoryAgent) redirect('/dashboard/inventory')
  if (isUserRoleSales) redirect('/dashboard/new')
  if (isUserRoleProduction || isUserRoleEngineer) redirect('/dashboard/db')
  if (isUserRoleFinance) redirect('/dashboard/ledger')
  return notFound()
}

export default Page
