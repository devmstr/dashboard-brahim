import { NavItem, SidebarNavItem } from '@/types'

export const EmployeeDashboardConfig: {
  sidebar: SidebarNavItem[]
  pages: Record<string, NavItem[]>
} = {
  sidebar: [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: 'dashboard'
    },
    {
      title: 'Orders',
      href: '/dashboard/orders',
      icon: 'orders'
    },
    {
      title: 'Details',
      href: '/dashboard/details',
      icon: 'details'
    },
    {
      title: 'Notifications',
      href: '/dashboard/notification',
      icon: 'notification'
    }
  ],
  pages: {
    orders: [
      {
        title: 'All',
        href: '/dashboard/orders'
      },
      {
        title: 'Status',
        href: '/dashboard/orders/status'
      }
    ]
  }
}
