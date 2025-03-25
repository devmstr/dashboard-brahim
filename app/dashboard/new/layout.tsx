import { LinkLineList } from '@/components/link-line-list'
import { NewOrderProvider } from '@/components/new-order.provider'
import { SidebarNavItem } from '@/types'

interface Props {
  children: React.ReactNode
}

const Layout: React.FC<Props> = ({ children }: Props) => {
  let items = [
    {
      title: 'Acheteur',
      key: 'client',
      href: '/dashboard/new',
      icon: 'addClient'
    },
    {
      title: 'Commande',
      key: 'commande',
      href: '/dashboard/new/order',
      icon: 'packagePlus'
    },
    {
      title: 'Paiement',
      key: 'payment',
      href: '/dashboard/new/payment',
      icon: 'dollar'
    },
    {
      title: 'Annexes',
      key: 'upload',
      href: '/dashboard/new/upload',
      icon: 'upload'
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
