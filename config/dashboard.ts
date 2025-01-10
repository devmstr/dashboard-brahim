import { SidebarNavItem } from '@/types'

export const LAYOUT_LINKS: SidebarNavItem[] = [
  {
    title: 'Tableau De Board',
    href: '/dashboard',
    icon: 'dashboard',
    key: 'dashboard'
  },
  {
    title: 'Nouveau',
    href: '/dashboard/new',
    icon: 'packagePlus',
    key: 'new'
  },
  {
    title: 'Planning',
    href: '/dashboard/timeline',
    icon: 'gantt',
    key: 'timeline'
  },
  {
    title: 'Commandes',
    href: '/dashboard/orders',
    icon: 'orders',
    key: 'orders'
  },

  // {
  //   title: 'Stock',
  //   href: '/dashboard/stock',
  //   icon: 'stock'
  // },
  {
    title: 'Clients',
    href: '/dashboard/clients',
    icon: 'clients',
    key: 'clients'
  },
  {
    title: 'Véhicule',
    href: '/dashboard/cars',
    icon: 'car',
    key: 'cars'
  },
  {
    title: 'Paramètres',
    href: '/dashboard/settings',
    icon: 'settings',
    key: 'settings'
  }
]
