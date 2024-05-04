import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { ROLES } from '@/config/accounts'
import { EmployeeDashboardConfig } from '@/config/dashboard'
import { authOptions } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { NavItem, SidebarNavItem } from '@/types'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = async ({ children }: LayoutProps) => {
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
  const session = await getServerSession(authOptions)
  if (session?.user?.role == ROLES.ADMIN)
    sideBarNavItems.push({
      title: 'Ajouter',
      href: '/dashboard/admin',
      icon: 'users'
    })
  return (
    <div className={cn('bg-gray-50 bg-opacity-90 flex')}>
      <DashboardSidebar items={sideBarNavItems} />
      <div className="relative container py-10 left-0 flex flex-col w-full ">
        {children}
      </div>
    </div>
  )
}

export default Layout
