import { LinkLineList } from '@/components/link-line-list'
import { SidebarNavItem } from '@/types'

interface Props {
  children: React.ReactNode
}

const Layout: React.FC<Props> = ({ children }: Props) => {
  let items = [
    ,
    {
      title: 'Catégories',
      key: 'categories',
      href: '/dashboard/pricing',
      icon: 'category'
    },
    {
      title: 'Produits',
      key: 'products',
      href: '/dashboard/pricing/products',
      icon: 'package'
    },
    {
      title: 'Clients',
      key: 'clients',
      href: '/dashboard/pricing/clients',
      icon: 'clients'
    },
    {
      title: 'Globale',
      key: 'global',
      href: '/dashboard/pricing/global',
      icon: 'globe'
    }
  ] as SidebarNavItem[]

  return (
    <div className="space-y-4">
      <LinkLineList items={items} t={{}} />
      {children}
    </div>
  )
}

export default Layout
