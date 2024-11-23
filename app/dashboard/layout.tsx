import { DashboardNav } from '@/components/dashboard-nav'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Loading } from '@/components/loading'
import { SidebarStateProvider } from '@/components/open-sidebar-provider'
import { ScrollArea } from '@/components/ui/scroll-area'
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
      title: 'Planning',
      href: '/dashboard',
      icon: 'timeline'
    },
    {
      title: 'Commandes',
      href: '/dashboard/orders',
      icon: 'dashboard'
    },
    {
      title: 'Paramètres',
      href: '/dashboard/settings',
      icon: 'settings'
    }
  ]

  return (
    <SidebarStateProvider>
      <div className="flex w-full h-full ">
        <DashboardSidebar
          className="flex h-screen inset-0 bg-primary z-40"
          items={sideBarNavItems}
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
