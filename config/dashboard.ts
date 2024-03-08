import { NavItem, SidebarNavItem } from '@/types'

export const EmployeeDashboardConfig: {
  sidebar: SidebarNavItem[]
  pages: Record<string, NavItem[]>
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
      title: 'Components',
      href: '/dashboard/components',
      icon: 'details'
    }
    // {
    //   title: 'Notifications',
    //   href: '/dashboard/notification',
    //   icon: 'notification'
    // }
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
