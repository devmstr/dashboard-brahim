import { Card } from '@/components/card'
import prisma from '@/lib/db'
import { EditCarForm, EditCarSchemaType } from './edit-car.form copy'

interface Props {
  params: { id: string }
}

const Page: React.FC<Props> = async ({ params }: Props) => {
  const carModel = await prisma.model.findUnique({
    where: { id: params.id },
    include: {
      Types: true,
      Family: {
        include: {
          Brand: true
        }
      }
    }
  })

  const data = {
    id: carModel?.id,
    brand: carModel?.Family?.Brand?.name,
    brandId: carModel?.Family?.Brand?.id,
    family: carModel?.Family?.name,
    familyId: carModel?.Family?.name,
    model: carModel?.name,
    types: carModel?.Types.map(({ id, name, fuel, year }) => ({
      id,
      name,
      fuel,
      year
    }))
  } as EditCarSchemaType

  return (
    <Card>
      <EditCarForm data={data} />
    </Card>
  )
}

export default Page
