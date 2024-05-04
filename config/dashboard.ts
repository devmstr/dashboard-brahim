import { NavItem, SidebarNavItem } from '@/types'

export const EmployeeDashboardConfig: {
  sidebar: SidebarNavItem[]
} = {
  sidebar: [
    {
      title: 'Timeline',
      href: '/dashboard/timeline',
      icon: 'dashboard'
    },
    {
      title: 'Orders',
      href: '/dashboard/orders',
      icon: 'orders'
    },
    {
      title: 'Ajouter',
      href: '/dashboard/employees',
      icon: 'users'
    }
  ]
}
