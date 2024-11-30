import React from 'react'
import { SidebarButton } from './sidebar-button'
import { UserAvatar } from './user-avatar'
import { getUser } from '@/lib/session'
import { UserAccountNav } from './user-account-nav'
import { Loading } from './loading'
import { SidebarNavItem } from '@/types'
import { LinkerList } from './breadcrumb'

interface DashboardNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DashboardNav = async (props: DashboardNavProps) => {
  const user = await getUser()
  if (!user) return <Loading />
  const avatarDropdownLinks: SidebarNavItem[] = [
    {
      title: 'Planning',
      href: '/dashboard/timeline',
      icon: 'timeline'
    },
    {
      title: 'Commandes',
      href: '/dashboard/orders',
      icon: 'dashboard'
    },
    {
      title: 'Stock',
      href: '/dashboard/stock',
      icon: 'stock'
    },
    {
      title: 'Clients',
      href: '/dashboard/clients',
      icon: 'clients'
    },
    {
      title: 'Paramètres',
      href: '/dashboard/settings',
      icon: 'settings'
    }
  ]

  // let items: SidebarNavItem[] = [
  //   {
  //     title: 'Settings',
  //     href: '/dashboard/settings',
  //     translationKey: 'settings',
  //     icon: 'settings'
  //   }
  // ]
  return (
    <div {...props}>
      <div className="flex gap-1 items-center">
        <SidebarButton />
        <LinkerList />
      </div>
      <nav className="container flex items-center justify-end ">
        <UserAccountNav items={avatarDropdownLinks} user={user} />
      </nav>
    </div>
  )
}
