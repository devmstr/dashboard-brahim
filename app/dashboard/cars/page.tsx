import { CarTable } from '@/components/car-table'
import { Card } from '@/components/card'
import { AddCarButton } from './add-car.button'
import { useServerCheckRoles } from '@/hooks/useServerCheckRoles'
import prisma from '@/lib/db'
interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const cars = await prisma.carModel.findMany({
    include: {
      Types: true,
      Family: {
        include: {
          Brand: true
        }
      }
    }
  })
  const data = cars.map(
    ({ Family, Types, familyId, radiatorId, name, ...car }) => ({
      ...car,
      model: name,
      brand: Family?.Brand?.name,
      brandId: Family?.brandId,
      familyId,
      family: Family?.name,
      type: Types[0]?.name,
      typeId: Types[0]?.id,
      radiatorId
    })
  )
  return (
    <Card>
      <CarTable data={data}>
        <AddCarButton />
      </CarTable>
    </Card>
  )
}

export default Page
