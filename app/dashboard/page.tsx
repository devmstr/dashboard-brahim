import { Card } from '@/components/card'
import { useServerCheckRoles } from '@/hooks/useServerCheckRoles'
import { useServerUser } from '@/hooks/useServerUser'
import { notFound, redirect } from 'next/navigation'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const isUserRoleAdmin = await useServerCheckRoles('ADMIN')
  const isUserRoleSales = await useServerCheckRoles('SALES')
  const isUserRoleProduction = await useServerCheckRoles('PRODUCTION')
  const isUserRoleEngineer = await useServerCheckRoles('ENGINEER')
  if (isUserRoleSales) redirect('/dashboard/new')
  if (isUserRoleProduction || isUserRoleEngineer) redirect('/dashboard/orders')
  return notFound()
}

export default Page
