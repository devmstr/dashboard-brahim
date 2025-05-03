import { Card } from '@/components/card'
import { RadiatorEditForm } from './radiator-edit.from'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card>
      <RadiatorEditForm
        data={{
          id: 'rad-123456',
          isActive: true,
          type: 'Radiateur',
          fabrication: 'Confection',
          cooling: 'Eau',
          packaging: 'Carton',
          quantity: 2,
          dirId: 'DIR-789',
          description: '',
          note: 'note',
          modification: 'a',
          // car: {
          //   id: 'car-456',
          //   model: 'Peugeot 308',
          //   brand: 'Peugeot'
          // },
          core: {
            fins: 'Droite (Normale)',
            finsPitch: 10,
            tube: '7',
            rows: 2,
            dimensions: {
              height: 480,
              width: 320
            }
          },
          collector: {
            isTinned: true,
            perforation: 'Perforé',
            tightening: 'Boulonné',
            position: 'Côté',
            material: 'Laiton',
            upperDimensions: {
              height: 520,
              width: 340,
              thickness: 1.5
            },
            lowerDimensions: {
              height: 520,
              width: 340,
              thickness: 1.5
            }
          },
          radiatorAttachment: [
            {
              name: 'schema-technique.pdf',
              size: 1245678,
              type: 'application/pdf',
              url: '/uploads/schema-technique.pdf'
            },
            {
              name: 'photo-radiateur.jpg',
              size: 856432,
              type: 'image/jpeg',
              url: '/uploads/photo-radiateur.jpg'
            }
          ]
        }}
      />
    </Card>
  )
}

export default Page
