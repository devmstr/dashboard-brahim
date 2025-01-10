import { DashboardNav } from '@/components/dashboard-nav'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Loading } from '@/components/loading'
import { SidebarStateProvider } from '@/components/open-sidebar-provider'
import { NewOrderProvider } from '@/components/new-order.provider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LAYOUT_LINKS } from '@/config/dashboard'
import { useServerUser } from '@/hooks/useServerUser'
import { SidebarNavItem } from '@/types'
import { ReactNode } from 'react'
import { useServerCheckRoles } from '@/hooks/useServerCheckRoles'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = async ({ children }: LayoutProps) => {
  const isUserRoleAdmin = await useServerCheckRoles('ADMIN')
  const isUserRoleSales = await useServerCheckRoles('SALES')
  const isUserRoleProduction = await useServerCheckRoles('PRODUCTION')
  const isUserRoleEngineer = await useServerCheckRoles('ENGINEER')

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
      ['new', 'timeline', 'orders', 'clients', 'cars', 'settings'].includes(
        key as string
      )
    )

  return (
    <SidebarStateProvider>
      <div className="flex w-full h-full ">
        <DashboardSidebar
          className="hidden md:flex h-screen inset-0 bg-primary z-40"
          items={linkedList}
        />
        <div className="flex flex-col  min-h-screen w-full">
          <DashboardNav className="w-full bg-white flex items-center z-30 h-16 shadow-md " />
          <ScrollArea className="w-full h-full max-h-[calc(100vh-4rem)]">
            <main className="container py-8">{children}</main>
          </ScrollArea>
        </div>
      </div>
    </SidebarStateProvider>
  )
}

export default Layout
