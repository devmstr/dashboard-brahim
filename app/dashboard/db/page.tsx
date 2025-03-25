import { Card } from '@/components/card'
import { DatabaseTable } from './database-table'

interface Props {}

const products = [
  {
    id: 'PRD001',
    dirId: 'DIR123',
    barcode: '8901234567890',
    designation: 'Radiateur Komatsu PC200-8',
    brand: 'Komatsu',
    model: 'PC200-8',
    createdAt: '2023-01-15T10:30:00Z',
    company: 'Acme Corporation'
  },
  {
    id: 'PRD002',
    dirId: 'DIR124',
    barcode: '8901234567891',
    designation: 'Filtre à huile Caterpillar 320D',
    brand: 'Caterpillar',
    model: '320D',
    createdAt: '2023-02-20T14:45:00Z',
    company: 'TechSolutions Inc.'
  },
  {
    id: 'PRD003',
    dirId: 'DIR125',
    barcode: '8901234567892',
    designation: 'Pompe hydraulique Hitachi ZX330',
    brand: 'Hitachi',
    model: 'ZX330',
    createdAt: '2023-03-10T09:15:00Z',
    company: 'PrintMaster Ltd'
  },
  {
    id: 'PRD004',
    dirId: 'DIR126',
    barcode: '8901234567893',
    designation: 'Alternateur Volvo EC210',
    brand: 'Volvo',
    model: 'EC210',
    createdAt: '2023-04-05T16:20:00Z',
    company: 'Global Enterprises'
  },
  {
    id: 'PRD005',
    dirId: 'DIR127',
    barcode: '8901234567894',
    designation: 'Démarreur Liebherr R954',
    brand: 'Liebherr',
    model: 'R954',
    createdAt: '2023-05-12T11:10:00Z',
    company: 'Café Express'
  },
  {
    id: 'PRD006',
    dirId: 'DIR128',
    barcode: '8901234567895',
    designation: 'Turbocompresseur JCB JS220',
    brand: 'JCB',
    model: 'JS220',
    createdAt: '2023-06-18T13:25:00Z',
    company: 'DataCenter Solutions'
  },
  {
    id: 'PRD007',
    dirId: 'DIR129',
    barcode: '8901234567896',
    designation: 'Injecteur Doosan DX300',
    brand: 'Doosan',
    model: 'DX300',
    createdAt: '2023-07-22T08:40:00Z',
    company: 'Interior Designs Co.'
  },
  {
    id: 'PRD008',
    dirId: 'DIR130',
    barcode: '8901234567897',
    designation: 'Pompe à eau Kobelco SK200',
    brand: 'Kobelco',
    model: 'SK200',
    createdAt: '2023-08-30T15:55:00Z',
    company: 'HealthyWork Inc.'
  },
  {
    id: 'PRD009',
    dirId: 'DIR131',
    barcode: '8901234567898',
    designation: 'Capteur de pression Case CX350',
    brand: 'Case',
    model: 'CX350',
    createdAt: '2023-09-14T10:05:00Z',
    company: 'SecureTech Ltd'
  },
  {
    id: 'PRD010',
    dirId: 'DIR132',
    barcode: '8901234567899',
    designation: 'Vérin hydraulique Hyundai R320',
    brand: 'Hyundai',
    model: 'R320',
    createdAt: '2023-10-25T12:15:00Z',
    company: 'Office Supplies Co.'
  },
  {
    id: 'PRD011',
    dirId: 'DIR133',
    barcode: '8901234567900',
    designation: 'Segment de piston Komatsu PC300',
    brand: 'Komatsu',
    model: 'PC300',
    createdAt: '2023-11-08T09:30:00Z',
    company: 'Communications Plus'
  },
  {
    id: 'PRD012',
    dirId: 'DIR134',
    barcode: '8901234567901',
    designation: 'Filtre à air Caterpillar 330D',
    brand: 'Caterpillar',
    model: '330D',
    createdAt: '2023-12-17T14:20:00Z',
    company: 'Mobile Worker Ltd'
  }
]

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card>
      <DatabaseTable data={products} />
    </Card>
  )
}

export default Page
