import { DashboardNav } from '@/components/dashboard-nav'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Loading } from '@/components/loading'
import { Toaster } from '@/components/ui/toaster'
import { ROLES } from '@/config/accounts'
import { EmployeeDashboardConfig } from '@/config/dashboard'
import { authOptions } from '@/lib/auth'
import { getUser } from '@/lib/session'
import { cn } from '@/lib/utils'
import { NavItem, SidebarNavItem } from '@/types'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
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
      href: '/dashboard/timeline',
      icon: 'dashboard'
    },
    {
      title: 'Orders',
      href: '/dashboard/orders',
      icon: 'orders'
    }
  ]

  return (
    <div className={cn('bg-gray-50 min-h-[93vh] bg-opacity-90 flex')}>
      <DashboardNav className="relative w-full flex inset-0 h-16 z-[9999] bg-primary " />
      <div className="">
        <DashboardSidebar items={sideBarNavItems} />
        <main className="container">{children}</main>
      </div>
    </div>
  )
}

export default Layout
