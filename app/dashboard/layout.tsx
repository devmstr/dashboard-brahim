import { DashboardNav } from '@/components/dashboard-nav'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { SidebarStateProvider } from '@/components/open-sidebar-provider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LAYOUT_LINKS } from '@/config/dashboard'
import { useServerCheckRoles } from '@/hooks/useServerCheckRoles'
import { getCurrentUser } from '@/lib/session'
import { ROUTE_ROLE_MAP } from '@/middleware'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = async ({ children }: LayoutProps) => {
  const user = await getCurrentUser()
  const userRoles: string[] = [user?.role || '']

  // Filter links based on ROUTE_ROLE_MAP and userRoles
  let linkedList = LAYOUT_LINKS.filter((link) => {
    if (!link.href) return true
    const allowedRoles = Object.entries(ROUTE_ROLE_MAP).find(([route]) =>
      link.href?.startsWith(route)
    )?.[1]
    if (!allowedRoles) return true // If not protected, show to all
    return allowedRoles.some((role) => userRoles.includes(role))
  })

  // If the user is a sales manager, remove the printing link
  if (user?.role == 'SALES_MANAGER')
    linkedList = linkedList.filter((link) => link.key != 'printing')
  // If the user is a sales agent, change the inventory link to "Tarifications"
  if (['SALES_AGENT', 'SALES_MANAGER'].includes(user?.role || '')) {
    linkedList = linkedList.map((link) =>
      link.key == 'inventory'
        ? {
            ...link,
            title: 'Tarifications',
            icon: 'pricingTag'
          }
        : link
    )
  }

  return (
    <SidebarStateProvider>
      <div className="flex w-full h-full ">
        <DashboardSidebar
          className="hidden md:flex h-screen inset-0 bg-primary z-40"
          items={linkedList}
        />
        <div className="flex flex-col  min-h-screen w-full">
          <DashboardNav className="w-full bg-white flex items-center z-30 h-16 shadow-md px-3" />
          <ScrollArea className="w-full h-full max-h-[calc(100vh-4rem)]">
            <main className="container py-8">{children}</main>
          </ScrollArea>
        </div>
      </div>
    </SidebarStateProvider>
  )
}

export default Layout
