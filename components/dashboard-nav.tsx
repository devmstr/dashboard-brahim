import { LAYOUT_LINKS } from '@/config/dashboard'
import { getUser } from '@/lib/session'
import React from 'react'
import { LinkerList } from './breadcrumb'
import { Loading } from './loading'
import { SidebarButton } from './sidebar-button'
import { UserAccountNav } from './user-account-nav'

interface DashboardNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DashboardNav = async (props: DashboardNavProps) => {
  const user = await getUser()
  if (!user) return <Loading />
  let linkedList = LAYOUT_LINKS
  if (user.role !== 'ADMIN')
    linkedList = linkedList.filter(
      (i) => i.href?.replaceAll('/', '') != 'dashboard'
    )
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
