import { DashboardNav } from '@/components/dashboard-nav'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { EmployeeDashboardConfig } from '@/config/dashboard'

interface LayoutProps {
  children: React.ReactNode
}

export default async function EmployeeLayout({ children }: LayoutProps) {
  return (
    <div className="flex !max-h-screen h-screen w-full">
      <aside className="hidden md:flex flex-col h-full items-center bg-background ">
        <DashboardSidebar items={EmployeeDashboardConfig.sidebar} />
      </aside>
      <main className="flex flex-col w-full h-full">
        <nav className="h-16 z-40 w-full bg-primary">
          <div className="container h-full flex items-center justify-between">
            <DashboardNav />
          </div>
        </nav>
        <div>{children}</div>
      </main>
    </div>
  )
}
