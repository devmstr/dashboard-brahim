import { Customer, Product } from '@/types'

// Sample product data
export const sampleProducts: (Product & { createdAt: string })[] = [
  {
    id: 'RAX3D5CEF',
    label: 'RA 0525X0600 6D7 10 0610X0120 PC',
    stockLevel: 1,
    price: 75000,
    bulkPrice: 67500,
    createdAt: '2024-03-24T10:15:00Z'
  },
  {
    id: 'FAX8G2KLP',
    label: 'FE 0550X0600 4Z7 10 0620X0105 PC',
    stockLevel: 1,
    price: 62000,
    bulkPrice: 55800,
    image: '/placeholder.svg?height=80&width=80',
    createdAt: '2024-03-24T10:20:00Z'
  },
  {
    id: 'RAX5H7MNT',
    label: 'RA 0530X0540 4D7 10 0545X085 PC KOMATSU FD60',
    stockLevel: 1,
    price: 105000,
    bulkPrice: 94500,
    image: '/placeholder.svg?height=80&width=80',
    createdAt: '2024-03-24T10:25:00Z'
  },
  {
    id: 'FAX4Z8VWX',
    label: 'FE 0570X0450 5D7 10 0460X0125 PC',
    stockLevel: 1,
    price: 50000,
    bulkPrice: 45000,
    image: '/placeholder.svg?height=80&width=80',
    createdAt: '2024-03-24T10:30:00Z'
  },
  {
    id: 'RAX9T2YQP',
    label: 'RA 0580X0570 4D7 10 0585X0115 PC BTR PY-2 APC2',
    stockLevel: 1,
    price: 88000,
    bulkPrice: 79200,
    image: '/placeholder.svg?height=80&width=80',
    createdAt: '2024-03-24T10:35:00Z'
  },
  {
    id: 'FAX6M1BCX',
    label: 'FE 0600X0600 5D7 10 0620X0110 PC AEREE',
    stockLevel: 1,
    price: 110000,
    bulkPrice: 99000,
    image: '/placeholder.svg?height=80&width=80',
    createdAt: '2024-03-24T10:40:00Z'
  },
  {
    id: 'RAX7P3FDM',
    label: 'RE 0560X0560 3D7 10 0595X0110 PC PERKINS AB37590',
    stockLevel: 1,
    price: 97000,
    bulkPrice: 87300,
    image: '/placeholder.svg?height=80&width=80',
    createdAt: '2024-03-24T10:45:00Z'
  },
  {
    id: 'FAX5X9HLQ',
    label: 'FE 0590X0480 4D7 10 0560X0160 BC',
    stockLevel: 1,
    price: 54000,
    bulkPrice: 48600,
    image: '/placeholder.svg?height=80&width=80',
    createdAt: '2024-03-24T10:50:00Z'
  },
  {
    id: 'RAX2M7VKJ',
    label: 'RA 0525X1020 6D7 10 1020X0153 PC BTR 80 APC40',
    stockLevel: 1,
    price: 101000,
    bulkPrice: 90900,
    image: '/placeholder.svg?height=80&width=80',
    createdAt: '2024-03-24T10:55:00Z'
  },
  {
    id: 'FAX3Z6BQP',
    label: 'FE 0600X0530 4Z7 10 0550X0100 PC',
    stockLevel: 1,
    price: 89000,
    bulkPrice: 80100,
    image: '/placeholder.svg?height=80&width=80',
    createdAt: '2024-03-24T11:00:00Z'
  },
  {
    id: 'RAX4L9DMQ',
    label: 'RE 0540X0550 3D7 10 0575X0120 PC CATERPILLAR D6',
    stockLevel: 1,
    price: 92000,
    bulkPrice: 82800,
    image: '/placeholder.svg?height=80&width=80',
    createdAt: '2024-03-24T11:05:00Z'
  },
  {
    id: 'FAX7T2YKN',
    label: 'FE 0575X0490 4D7 10 0520X0140 PC VOLVO L120',
    stockLevel: 1,
    price: 76000,
    bulkPrice: 68400,
    image: '/placeholder.svg?height=80&width=80',
    createdAt: '2024-03-24T11:10:00Z'
  },
  {
    id: 'RAX8M3VJP',
    label: 'RA 0610X0580 5D7 10 0625X0130 PC DAEWOO DH220',
    stockLevel: 1,
    price: 103000,
    bulkPrice: 92700,
    image: '/placeholder.svg?height=80&width=80',
    createdAt: '2024-03-24T11:15:00Z'
  },
  {
    id: 'FAX6N5BQW',
    label: 'FE 0620X0550 4Z7 10 0600X0120 PC HYUNDAI 210LC',
    stockLevel: 1,
    price: 88000,
    bulkPrice: 79200,
    image: '/placeholder.svg?height=80&width=80',
    createdAt: '2024-03-24T11:20:00Z'
  },
  {
    id: 'RAX3P8LTX',
    label: 'RA 0630X0600 5D7 10 0640X0145 PC HITACHI EX200',
    stockLevel: 1,
    price: 109000,
    bulkPrice: 98100,
    image: '/placeholder.svg?height=80&width=80',
    createdAt: '2024-03-24T11:25:00Z'
  }
]

// Sample customer data
export const sampleCustomers: Customer[] = [
  {
    id: '1',
    name: 'Ahmed Benali',
    company: 'Réparation Auto Benali',
    phone: '0550123456',
    city: 'Oran'
  },
  {
    id: '2',
    name: 'Karim Bouzid',
    company: 'Garage Bouzid',
    phone: '0661234567',
    city: 'Batna'
  },
  {
    id: '3',
    name: 'Nour El Houda Mansouri',
    company: 'Atelier Auto Mansouri',
    phone: '0772345678',
    city: ''
  },
  {
    id: '4',
    name: 'Omar Cherif',
    company: 'Mécaniciens Cherif',
    phone: '0543456789',
    city: ''
  },
  {
    id: '5',
    name: 'Fatima Zohra Meddah',
    company: 'Spécialistes Radiateurs Meddah',
    phone: '0678567890',
    city: ''
  },
  {
    id: '6',
    name: 'Hassan Bouchareb',
    company: 'Auto Services Bouchareb',
    phone: '0551678901',
    city: ''
  },
  {
    id: '7',
    name: 'Rania Sahnoune',
    company: 'Garage Sahnoune',
    phone: '0662789012',
    city: ''
  },
  {
    id: '8',
    name: 'Mehdi Bensalem',
    company: 'Réparation Express Bensalem',
    phone: '0773890123',
    city: ''
  },
  {
    id: '9',
    name: 'Zineb Boudjemaa',
    company: 'Mécanique Générale Boudjemaa',
    phone: '0544901234',
    city: ''
  },
  {
    id: '10',
    name: 'Yacine Ait Kaci',
    company: 'Atelier Ait Kaci',
    phone: '0679012345',
    city: ''
  },
  {
    id: '11',
    name: 'Sofiane Merah',
    company: 'Garage Merah',
    phone: '0552123456',
    city: ''
  },
  {
    id: '12',
    name: 'Amel Dali',
    company: 'Spécialistes Peinture Dali',
    phone: '0663234567',
    city: ''
  },
  {
    id: '13',
    name: 'Redouane Belkacem',
    company: 'Atelier Auto Belkacem',
    phone: '0774345678',
    city: ''
  },
  {
    id: '14',
    name: 'Meriem Guendouzi',
    company: 'Réparation Carrosserie Guendouzi',
    phone: '0545456789',
    city: ''
  },
  {
    id: '15',
    name: 'Nassim Boudiaf',
    company: 'Mécanique Auto Boudiaf',
    phone: '0677567890',
    city: ''
  }
]
