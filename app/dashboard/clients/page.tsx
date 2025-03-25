import { Card } from '@/components/card'
import { ClientTable } from '@/components/client-table'
import { AddClientDialog } from './add-client.dialog'
import { AddNewClientDialogButton } from '@/components/add-new-client.button'
import { SearchComboBox } from '@/components/search-combo-box'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card className="">
      <div className="flex justify-end items-center gap-3 mb-5">
        <AddNewClientDialogButton />
      </div>
      <ClientTable
        data={[
          {
            id: 'CLX24DF4T',
            name: 'Mohamed',
            phone: '0658769361',
            label: '(SARL) GoldenRad ',
            location: 'Ghardaïa',
            orderCount: 10
          },
          {
            id: 'CLX89GJ7K',
            name: 'Amine',
            phone: '0667321984',
            label: '(EURL) Tech Innov',
            location: 'Alger',
            orderCount: 15
          },
          {
            id: 'CLX56TY9P',
            name: 'Nassim',
            phone: '0558743621',
            label: '(SARL) BuildProSociété',
            location: 'Oran',
            orderCount: 8
          },
          {
            id: 'CLX77MN3Q',
            name: 'Yacine',
            phone: '0678125496',
            label: '(SAS) GreenAgro',
            location: 'Constantine',
            orderCount: 20
          }
        ]}
      />
    </Card>
  )
}

export default Page
