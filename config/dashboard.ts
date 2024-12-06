import { SidebarNavItem } from '@/types'

export const LAYOUT_LINKS: SidebarNavItem[] = [
  {
    title: 'Tableau De Board',
    href: '/dashboard',
    icon: 'dashboard'
  },
  {
    title: 'Nouveau',
    href: '/dashboard/new',
    icon: 'packagePlus'
  },
  {
    title: 'Planning',
    href: '/dashboard/timeline',
    icon: 'timeline'
  },
  {
    title: 'Commandes',
    href: '/dashboard/orders',
    icon: 'orders'
  },
  // {
  //   title: 'Stock',
  //   href: '/dashboard/stock',
  //   icon: 'stock'
  // },
  {
    title: 'Clients',
    href: '/dashboard/clients',
    icon: 'clients'
  },
  {
    title: 'Paramètres',
    href: '/dashboard/settings',
    icon: 'settings'
  }
]
