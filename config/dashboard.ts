import { SidebarNavItem } from '@/types'

export const LAYOUT_LINKS: SidebarNavItem[] = [
  // {
  //   title: 'Tableau De Board',
  //   href: '/dashboard',
  //   icon: 'dashboard',
  //   key: 'dashboard'
  // },
  {
    title: 'Nouveau',
    href: '/dashboard/new',
    icon: 'packagePlus',
    key: 'new',
    matchChildren: true
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
    title: 'Base De Données',
    href: '/dashboard/db',
    icon: 'database',
    key: 'db'
  },
  {
    title: 'Analyses & indicateurs',
    href: '/dashboard/procurement/analytics',
    icon: 'dashboard',
    key: 'procurement-analytics',
    active: false
  },
  {
    title: 'Achats',
    href: '/dashboard/procurement',
    icon: 'deliveryPackage',
    key: 'procurement'
  },
  {
    title: "Demandes d'achat",
    href: '/dashboard/procurement/requisitions',
    icon: 'list',
    key: 'procurement-requisitions',
    active: true
  },
  {
    title: 'Bons de commande',
    href: '/dashboard/procurement/purchase-orders',
    icon: 'packagePlus',
    key: 'procurement-purchase-orders',
    active: true
  },
  {
    title: 'Réceptions',
    href: '/dashboard/procurement/receipts',
    icon: 'inbox',
    key: 'procurement-receipts',
    active: true
  },
  {
    title: 'Factures fournisseurs',
    href: '/dashboard/procurement/invoices',
    icon: 'fileText',
    key: 'procurement-invoices',
    active: true
  },
  {
    title: 'Fournisseurs',
    href: '/dashboard/procurement/suppliers',
    icon: 'users',
    key: 'procurement-suppliers',
    active: true
  },
  {
    title: "Appels d'offres / Devis",
    href: '/dashboard/procurement/rfqs',
    icon: 'fileText',
    key: 'procurement-rfqs',
    active: true
  },

  {
    title: 'Immobilisations',
    href: '/dashboard/procurement/assets',
    icon: 'factory',
    key: 'procurement-assets',
    active: true
  },
  {
    title: 'Articles',
    href: '/dashboard/procurement/items',
    icon: 'database',
    key: 'procurement-items',
    active: true
  },
  {
    title: 'Journal des Factures',
    href: '/dashboard/ledger',
    icon: 'ledger',
    key: 'ledger'
  },
  {
    title: "Journal d'audit",
    href: '/dashboard/audit-logs',
    icon: 'fileText',
    key: 'audit-logs'
  },
  {
    title: 'Les Marges',
    href: '/dashboard/pricing',
    icon: 'priceMargin',
    key: 'pricing'
  },
  {
    title: 'Stock',
    href: '/dashboard/inventory',
    icon: 'inventory',
    key: 'inventory'
  },
  {
    title: 'Clients',
    href: '/dashboard/clients',
    icon: 'clients',
    key: 'clients'
  },
  // moved under client to appear last On the Finance view
  {
    title: "Contrats d'achat",
    href: '/dashboard/procurement/contracts',
    icon: 'page',
    key: 'procurement-contracts',
    active: true
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
