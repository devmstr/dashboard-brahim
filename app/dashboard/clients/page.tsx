import { Card } from '@/components/card'
import { ClientTable } from '@/components/client-table'
import { AddClientDialog } from './add-client.dialog'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card className="">
      <div className="flex justify-end items-center gap-3">
        <AddClientDialog id={''} />
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
        data={[]}
      />
    </Card>
  )
}

export default Page
