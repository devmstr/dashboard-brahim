import PosDashboard from './pos-dashboard'
import prisma from '@/lib/db'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const [radiators, total] = await Promise.all([
    prisma.radiator.findMany({
      where: { isActive: true },
      include: {
        Inventory: true,
        Price: true
      }
      // skip,
      // take: limit
    }),
    prisma.radiator.count({
      where: { isActive: true }
    })
  ])

  return (
    <PosDashboard
      radiators={radiators.map((i) => ({
        id: i.id,
        label: i.label as string,
        stockLevel: Number(i.Inventory?.level),
        price: Number(i.Price?.unit),
        priceTTC: Number(i.Price?.unitTTC),
        bulkPrice: Number(i.Price?.bulk),
        bulkPriceTTC: Number(i.Price?.bulkTTC)
      }))}
      total={total}
    />
  )
}

export default Page
