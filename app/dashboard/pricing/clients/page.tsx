import { Card } from '@/components/card'
import { ClientMarginTable } from '../_components/client-margin.table'
import { Notification } from '@/components/notification'
interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold ">Marge par client</h2>
        <Notification variant={'information'}>
          <p className="font-medium opacity-80">
            La marge client s’applique uniquement aux commandes passées par ce
            client. Elle vient s’ajouter ou s’ajuster en plus des autres marges
            existantes.
          </p>
          <p className="mt-1">
            Prix HT = Coût de production + Marge Catégorie + Marge Produit +
            <span className="text-blue-500 font-bold"> Marge Client </span> +
            Marge Globale
          </p>
        </Notification>
      </div>
      {/* Client Table (your existing one) */}
      <ClientMarginTable
        data={[
          {
            id: 'CLXTGNYL4',
            name: 'Sonatrach Sh/trc Haoud Hamra',
            label: 'SPA',
            margin: 5,
            phone: '029737259',
            province: 'Ouargla',
            _count: { Orders: 150 }
          },
          {
            id: 'CLX29LV4C',
            name: 'Sonalgaz Energies Renouvelable',
            label: 'STE',
            margin: 7,
            phone: '029737259',
            province: 'Illizi',
            _count: { Orders: 33 }
          }
        ]}
      />
    </Card>
  )
}

export default Page
