import { NavItem, SidebarNavItem } from '@/types'

export const EmployeeDashboardConfig: {
  sidebar: SidebarNavItem[]
  pages: Record<string, NavItem[]>
} = {
  sidebar: [
    {
      title: 'Dashboard',
      href: '/',
      icon: 'dashboard'
    },
    {
      title: 'Orders',
      href: '/orders',
      icon: 'orders'
    },
    {
      title: 'Details',
      href: '/details',
      icon: 'details'
    },
    {
      title: 'Notifications',
      href: '/notification',
      icon: 'notification'
    }
  ],
  pages: {
    orders: [
      {
        title: 'All',
        href: '/orders'
      },
      {
        title: 'Status',
        href: '/orders/status'
      }
    ]
  }
}
