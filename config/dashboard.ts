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
    title: 'Vente',
    href: '/dashboard/pos',
    icon: 'dollar',
    key: 'pos'
  },
  {
    title: 'Facture Proforma',
    href: '/dashboard/printing',
    icon: 'bill',
    key: 'printing'
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
  {
    title: 'Stock',
    href: '/dashboard/inventory',
    icon: 'inventory',
    key: 'inventory'
  },
  {
    title: 'Base De Données',
    href: '/dashboard/db',
    icon: 'database',
    key: 'db'
  },
  {
    title: 'Journal des Factures',
    href: '/dashboard/ledger',
    icon: 'ledger',
    key: 'ledger'
  },
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
