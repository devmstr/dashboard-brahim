import { LAYOUT_LINKS } from '@/config/dashboard'
import { useServerUser } from '@/hooks/useServerUser'
import React from 'react'
import { LinkerList } from './breadcrumb'
import { Loading } from './loading'
import { SidebarButton } from './sidebar-button'
import { UserAccountNav } from './user-account-nav'
import { useServerCheckRoles } from '@/hooks/useServerCheckRoles'

interface DashboardNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DashboardNav = async (props: DashboardNavProps) => {
  const user = await useServerUser()
  const isUserRoleAdmin = await useServerCheckRoles('ADMIN')
  const isUserRoleSales = await useServerCheckRoles([
    'SALES_AGENT',
    'SALES_MANAGER'
  ])
  const isUserRoleProduction = await useServerCheckRoles([
    'PRODUCTION_MANAGER',
    'PRODUCTION_WORKER'
  ])
  const isUserRoleEngineer = await useServerCheckRoles([
    'ENGINEER',
    'ENGINEERING_MANAGER'
  ])

  let linkedList = LAYOUT_LINKS

  if (!isUserRoleAdmin)
    linkedList = linkedList.filter(
      (i) => i.href?.replaceAll('/', '') != 'dashboard'
    )
  if (isUserRoleProduction || isUserRoleEngineer)
    linkedList = linkedList.filter(({ key }) =>
      ['orders', 'settings'].includes(key as string)
    )
  if (isUserRoleSales)
    linkedList = linkedList.filter(({ key }) =>
      ['new', 'timeline', 'orders', 'clients', 'settings'].includes(
        key as string
      )
    )
  if (!user) return <Loading />
  return (
    <div {...props}>
      <div className="flex gap-1 items-center">
        <SidebarButton />
        <LinkerList />
      </div>
      <nav className="container flex items-center justify-end ">
        <UserAccountNav items={linkedList} user={user} />
      </nav>
    </div>
  )
}
