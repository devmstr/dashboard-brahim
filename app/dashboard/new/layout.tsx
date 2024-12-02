import { LinkLineList } from '@/components/link-line-list'
import { LAYOUT_LINKS } from '@/config/dashboard'
import { SidebarNavItem } from '@/types'

interface Props {
  children: React.ReactNode
}

const Layout: React.FC<Props> = ({ children }: Props) => {
  let items = [
    {
      title: 'Client',
      translationKey: 'client',
      href: '/dashboard/new/client',
      icon: 'addClient'
    },
    {
      title: 'Commande',
      translationKey: 'commande',
      href: '/dashboard/new/order',
      icon: 'package'
    },
    {
      title: 'Paiement',
      translationKey: 'payment',
      href: '/dashboard/new/payment',
      icon: 'dollar'
    }
  ] as SidebarNavItem[]

  return (
    <>
      <LinkLineList items={items} t={{}} />
      {children}
    </>
  )
}

export default Layout
