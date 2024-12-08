import { CarTable } from '@/components/car-table'
import { Card } from '@/components/card'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card>
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
        t={{
          id: 'Matricule',
          manufacture: 'Marque',
          car: 'Véhicule',
          model: 'model',
          fuel: 'Énergie',
          year: 'Années',
          placeholder: 'Rechercher...',
          columns: 'Colonnes',
          limit: 'Limite'
        }}
      />
    </Card>
  )
}

export default Page
