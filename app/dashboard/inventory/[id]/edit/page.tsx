import { useServerCheckRoles } from '@/hooks/useServerCheckRoles'
import { InventorySalesForm } from './inventory-sales.from'
import { InventoryAgentForm } from './inventory-agent.form'
import { notFound } from 'next/navigation'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const isSalesAgent = await useServerCheckRoles([
    'SALES_AGENT',
    'SALES_MANAGER'
  ])
  const isInventoryAgent = await useServerCheckRoles(['INVENTORY_AGENT'])
  if (isSalesAgent) return <InventorySalesForm />
  else if (isInventoryAgent) return <InventoryAgentForm />
  else return notFound()
}

export default Page
