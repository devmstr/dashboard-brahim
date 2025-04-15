export const COMPANY_LABELS_TYPE = [
  'Société Anonyme (SA)',
  'Société Par Actions (SPA)',
  'Société en Commandité Simple (SCS)',
  'Société en Commandité par Actions (SCA)',
  'Société A Responsabilité limitée (SARL)',
  'Sociétés en Nom Collectif (SNC)',
  'Entreprise individuelle (SP)',
  'Entreprise unipersonnelle à responsabilité limitée (EURL)',
  'START UP',
  'Établissement Public à Caractère Industriel et Commercial (EPIC)'
]
export const FABRICATION_TYPES = ['Confection', 'Rénovation']
export const ORDER_TYPES = ['Radiateur', 'Faisceau', 'Autre']
export const COOLING_SYSTEMS_TYPES = ['Eau', 'Air', 'Huile']
export const COLLECTOR_MATERIALS_TYPES = ['Acier', 'Laiton']
export const PACKAGING_TYPES = ['Carton', 'Bois']
export const FINS_TYPES = [
  { label: 'Zigzag', value: 'Z' },
  { label: 'Droite (Aérer)', value: 'A' },
  { label: 'Droite (Normale)', value: 'D' }
]
export const FINS_SIZES = [10, 11, 12, 14]
export const TUBE_TYPES = [
  { label: 'Étiré 7 (ET7)', value: '7' },
  { label: 'Étiré 9 (ET9)', value: '9' },
  { label: 'Machine Petit (MP)', value: 'M' }
]

export const CLAMPING_TYPES = [
  { label: 'Plié', value: 'P' },
  { label: 'Boulonné', value: 'B' }
]
export const COLLECTOR_POSITION_TYPES = [
  { label: 'Centrer', value: 'C' },
  { label: 'Dépassée', value: 'D' }
]
export const PAYMENT_TYPES = [
  'Espèces',
  'Versement',
  'Espèces + Versement',
  'Virement',
  'Cheque',
  'À terme'
]

export const PERFORATION_TYPES = ['Perforé', 'Non Perforé']
export const CAR_ENERGY_TYPES = ['Diesel', 'Essence']

export const userRoles = [
  'guest',
  'inventory_agent',
  'admin',
  'ceo',
  'finance_manager',
  'sales_agent',
  'sales_manager',
  'production_worker',
  'production_manager',
  'engineer',
  'engineering_manager',
  'consultant',
  'accountant'
] as const
