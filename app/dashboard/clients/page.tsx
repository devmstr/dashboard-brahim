import { Card } from '@/components/card'
import { ClientTable } from '@/components/client-table'
import { AddClientDialog } from './add-client.dialog'
import { AddNewClientDialogButton } from '@/components/add-new-client.button'
import { SearchComboBox } from '@/components/search-combo-box'

interface Props {}

const locationData = {
  countries: [
    {
      name: 'Algeria',
      provinces: [
        {
          name: 'Adrar',
          cities: ['Adrar', 'Reggane', 'Timimoun']
        },
        {
          name: 'Chlef',
          cities: ['Chlef', 'Ténès', 'Boukadir']
        },
        {
          name: 'Ghardaia',
          cities: [
            'Ghardaia',
            'Metlili',
            'El Meniaa',
            'Zelfana',
            'Mansoura',
            'Bonoura',
            'Oued Nacho',
            'Berriane',
            'Hassi Guegnoun',
            'El Atteuf',
            "M'Ghira",
            'El Mahmel'
          ]
        }
      ]
    }
  ]
}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card className="">
      <div className="flex justify-end items-center gap-3 mb-5">
        <AddNewClientDialogButton locationData={locationData} />
      </div>
      <ClientTable
        t={{
          orderCount: 'N°Commandes',
          columns: 'Colonnes',
          limit: 'Limite',
          placeholder: 'Rechercher ...',
          id: 'Matricule',
          label: 'Forme Juridique',
          name: 'Client',
          phone: 'Tél',
          location: 'Location'
        }}
        data={[
          {
            id: 'CLX24DF4T',
            name: 'Mohamed',
            phone: '0658769361',
            label:
              'START UPEntreprise unipersonnelle à responsabilité limitée (EURL)',
            location: 'Ghardia',
            orderCount: 10
          }
        ]}
      />
    </Card>
  )
}

export default Page
