import { MenuListLinks } from '@/components/menu-list-links'
import { EmployeeDashboardConfig } from '@/config/dashboard'
import React from 'react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = async ({ children }: LayoutProps) => {
  return (
    <div className=" container flex flex-col gap-1 pt-5">
      <MenuListLinks items={EmployeeDashboardConfig.pages.orders} />
      {children}
    </div>
  )
}

export default Layout
