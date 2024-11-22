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
    <div className="bg-gray-50 min-h-screen w-full">
      <DashboardNav className="relative w-full flex inset-0 h-16 z-[9999] bg-primary " />
      <div className="">
        <DashboardSidebar items={sideBarNavItems} />
        <main className="container py-8">{children}</main>
      </div>
    </div>
  )
}

export default Layout
