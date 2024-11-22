import { DashboardNav } from '@/components/dashboard-nav'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Loading } from '@/components/loading'
import { getUser } from '@/lib/session'
import { SidebarNavItem } from '@/types'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = async ({ children }: LayoutProps) => {
  const user = await getUser()
  if (!user) return <Loading />

  const sideBarNavItems: SidebarNavItem[] = [
    {
      title: 'Timeline',
      href: '/dashboard',
      icon: 'dashboard'
    },
    {
      title: 'Orders',
      href: '/dashboard/orders',
      icon: 'orders'
    }
  ]

  return (
    <div className="flex">
      <DashboardSidebar items={sideBarNavItems} />
      <div className="flex flex-col bg-gray-50 min-h-screen w-full">
        <DashboardNav className="w-full flex h-16 z-30 bg-primary " />
        <main className="container py-8">{children}</main>
      </div>
    </div>
  )
}

export default Layout
