import { Card } from '@/components/card'
import { LedgerTable } from './ledger.table'

interface Props {}

// Sample data for the LedgerTable component
const sampleLedgerData = [
  {
    billId: '24-2025',
    id: 'FAX3D6T89',
    total: 125000,
    items: 6,
    createdAt: '2025-03-15T10:30:00Z',
    company: 'Acme Corporation',
    phone: '0612345678',
    location: 'Algiers'
  },
  {
    billId: '26-2025',
    id: 'FAX9KJ4M1',
    total: 147500,
    items: 13,
    createdAt: '2025-03-18T14:45:00Z',
    company: 'TechSolutions Inc.',
    phone: '0687654321',
    location: 'Oran'
  },
  {
    billId: '27-2025',
    id: 'FAX7XQ8P5',
    total: 95000,
    items: 4,
    createdAt: '2025-03-22T09:15:00Z',
    company: 'PrintMaster Ltd',
    phone: '0623456789',
    location: 'Constantine'
  },
  {
    billId: '28-2025',
    id: 'FAX5ZV1L9',
    total: 110000,
    items: 15,
    createdAt: '2025-04-05T11:30:00Z',
    company: 'Global Enterprises',
    phone: '0634567898',
    location: 'Annaba'
  },
  {
    billId: '29-2025',
    id: 'FAX2BN3W7',
    total: 98000,
    items: 12,
    createdAt: '2025-04-10T15:20:00Z',
    company: 'Café Express',
    phone: '0645678901',
    location: 'Blida'
  },
  {
    billId: '30-2025',
    id: 'FAX6YT5R3',
    total: 150000,
    items: 10,
    createdAt: '2025-04-15T13:45:00Z',
    company: 'DataCenter Solutions',
    phone: '0656789012',
    location: 'Sétif'
  },
  {
    billId: '31-2025',
    id: 'FAX8PL9K1',
    total: 97000,
    items: 9,
    createdAt: '2025-04-20T10:10:00Z',
    company: 'Interior Designs Co.',
    phone: '0667890123',
    location: 'Tlemcen'
  },
  {
    billId: '32-2025',
    id: 'FAX4GH2D5',
    total: 135000,
    items: 6,
    createdAt: '2025-05-03T09:30:00Z',
    company: 'HealthyWork Inc.',
    phone: '0678901234',
    location: 'Batna'
  },
  {
    billId: '33-2025',
    id: 'FAX1QR7X6',
    total: 142000,
    items: 8,
    createdAt: '2025-05-12T14:15:00Z',
    company: 'SecureTech Ltd',
    phone: '0689012345',
    location: 'Djelfa'
  },
  {
    billId: '34-2025',
    id: 'FAX9MW3J8',
    total: 101000,
    items: 11,
    createdAt: '2025-05-18T11:45:00Z',
    company: 'Office Supplies Co.',
    phone: '0690123456',
    location: 'Béjaïa'
  },
  {
    billId: '35-2025',
    id: 'FAX2XH5N4',
    total: 127500,
    items: 6,
    createdAt: '2025-06-02T13:20:00Z',
    company: 'Communications Plus',
    phone: '0601234567',
    location: 'Ghardaïa'
  },
  {
    billId: '36-2025',
    id: 'FAX7VY1T9',
    total: 108000,
    items: 9,
    createdAt: '2025-06-10T10:00:00Z',
    company: 'Mobile Worker Ltd',
    phone: '0612345098',
    location: 'Biskra'
  }
]

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card>
      <LedgerTable userRole="ACCOUNTANT" data={sampleLedgerData} />
    </Card>
  )
}

export default Page
