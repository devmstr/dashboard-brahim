import { LinkLineList } from '@/components/link-line-list'
import { NewOrderProvider } from '@/components/new-order.provider'
import { SidebarNavItem } from '@/types'

interface Props {
  children: React.ReactNode
}

const Layout: React.FC<Props> = ({ children }: Props) => {
  let items = [
    {
      title: 'Client',
      key: 'client',
      href: '/dashboard/new',
      icon: 'addClient'
    },
    {
      title: 'Commande',
      key: 'commande',
      href: '/dashboard/new/order',
      icon: 'package'
    },
    {
      title: 'Paiement',
      key: 'payment',
      href: '/dashboard/new/payment',
      icon: 'dollar'
    }
  ] as SidebarNavItem[]

  return (
    <NewOrderProvider>
      <LinkLineList items={items} t={{}} />
      {children}
    </NewOrderProvider>
  )
}

export default Layout
