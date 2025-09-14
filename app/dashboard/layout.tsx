import { DashboardNav } from '@/components/dashboard-nav'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { SidebarStateProvider } from '@/components/open-sidebar-provider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LAYOUT_LINKS } from '@/config/dashboard'
import { useServerCheckRoles } from '@/hooks/useServerCheckRoles'
import { ROUTE_ROLE_MAP } from '@/middleware'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = async ({ children }: LayoutProps) => {
  const userRoles: string[] = []
  if (await useServerCheckRoles('ADMIN')) userRoles.push('ADMIN')
  if (await useServerCheckRoles('SALES_MANAGER'))
    userRoles.push('SALES_MANAGER')
  if (await useServerCheckRoles('SALES_AGENT')) userRoles.push('SALES_AGENT')
  if (await useServerCheckRoles('PRODUCTION_WORKER'))
    userRoles.push('PRODUCTION_WORKER')
  if (await useServerCheckRoles('PRODUCTION_MANAGER'))
    userRoles.push('PRODUCTION_MANAGER')
  if (await useServerCheckRoles('ENGINEER')) userRoles.push('ENGINEER')
  if (await useServerCheckRoles('ENGINEERING_MANAGER'))
    userRoles.push('ENGINEERING_MANAGER')
  if (await useServerCheckRoles('FINANCE_MANAGER')) userRoles.push('FINANCE_MANAGER')
  if (await useServerCheckRoles('CONSULTANT')) userRoles.push('CONSULTANT')
  if (await useServerCheckRoles('INVENTORY_AGENT'))
    userRoles.push('INVENTORY_AGENT')

  // Filter links based on ROUTE_ROLE_MAP and userRoles
  let linkedList = LAYOUT_LINKS.filter((link) => {
    if (!link.href) return true
    const allowedRoles = Object.entries(ROUTE_ROLE_MAP).find(([route]) =>
      link.href?.startsWith(route)
    )?.[1]
    if (!allowedRoles) return true // If not protected, show to all
    return allowedRoles.some((role) => userRoles.includes(role))
  })

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
