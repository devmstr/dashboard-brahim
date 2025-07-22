import { CarTable } from '@/components/car-table'
import { Card } from '@/components/card'
import { AddCarButton } from './add-car.button'
import { useServerCheckRoles } from '@/hooks/useServerCheckRoles'
import prisma from '@/lib/db'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const isUserRoleValidator = await useServerCheckRoles('CONSULTANT')

  // Fetch car types with their model, family, and brand
  const carTypes = await prisma.type.findMany({
    include: {
      Model: {
        include: {
          Family: {
            include: {
              Brand: true
            }
          }
        }
      }
    }
  })

  const cars = carTypes.map((type) => ({
    id: type.id,
    brand: type.Model?.Family?.Brand?.name || 'N/A',
    family: type.Model?.Family?.name || 'N/A',
    model: type.Model?.name || 'N/A',
    modelId: type.modelId,
    type: type.name || 'N/A',
    year: type.year || 'N/A',
    fuel: type.fuel || 'N/A'
  }))

  return (
    <Card>
      <CarTable data={cars}>{true && <AddCarButton />}</CarTable>
    </Card>
  )
}

export default Page
