import { CarTable } from '@/components/car-table'
import { Card } from '@/components/card'
import { AddCarButton } from './add-car.button'
import { useServerCheckRoles } from '@/hooks/useServerCheckRoles'

interface Props {}

const Page: React.FC<Props> = async ({}: Props) => {
  const isUserRoleValidator = await useServerCheckRoles('CONSULTANT')
  return (
    <Card>
      {true && (
        <div className="flex justify-end items-center gap-3 mb-5">
          <AddCarButton />
        </div>
      )}
      <CarTable
        data={[
          {
            id: 'vex5d7g9h',
            manufacture: 'CAT',
            model: 'Bulldozer',
            car: 'D5',
            year: 2015,
            fuel: 'Diesel'
          }
        ]}
      />
    </Card>
  )
}

export default Page
