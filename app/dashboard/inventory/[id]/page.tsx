import { useServerCheckRoles } from '@/hooks/useServerCheckRoles'
import { InventorySalesForm } from './inventory-sales.from'
import { InventoryAgentForm } from './inventory-agent.form'
import { notFound } from 'next/navigation'
import prisma from '@/lib/db'

interface Props {
  params: {
    id: string
  }
}

const Page: React.FC<Props> = async ({ params: { id } }: Props) => {
  const radiator = await prisma.radiator.findFirst({
    where: { id },
    include: {
      Inventory: true,
      Price: true
    }
  })
  if (!radiator) return notFound()

  const isSalesAgent = await useServerCheckRoles([
    'SALES_AGENT',
    'SALES_MANAGER'
  ])
  const isInventoryAgent = await useServerCheckRoles(['INVENTORY_AGENT'])
  if (isSalesAgent)
    return (
      <InventorySalesForm
        data={{
          id,
          label: radiator.label as string,
          isActive: Boolean(radiator.isActive),
          bulkPrice: radiator.Price?.bulk,
          bulkPriceThreshold: radiator.Price?.bulkThreshold,
          price: radiator.Price?.unit
        }}
      />
    )
  else if (isInventoryAgent)
    return (
      <InventoryAgentForm
        data={{
          id,
          label: radiator.label as string,
          isActive: Boolean(radiator.isActive),
          stockLevel: Number(radiator.Inventory?.level),
          minStockLevel: Number(radiator.Inventory?.alertAt),
          maxStockLevel: Number(radiator.Inventory?.maxLevel)
        }}
      />
    )
  else return notFound()
}

export default Page
