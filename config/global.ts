export const COMPANY_LABELS_TYPE = [
  { label: 'Société Anonyme (SA)', value: 'SA' },
  { label: 'Société Par Actions (SPA)', value: 'SPA)' },
  { label: 'Société en Commandité Simple (SCS)', value: 'SCS' },
  { label: 'Société en Commandité par Actions (SCA)', value: 'SCA' },
  { label: 'Société A Responsabilité limitée (SARL)', value: 'SARL' },
  { label: 'Sociétés en Nom Collectif (SNC)', value: 'SNC' },
  { label: 'Entreprise individuelle (SP)', value: 'SP' },
  {
    label: 'Entreprise unipersonnelle à responsabilité limitée (EURL)',
    value: 'EURL'
  },
  { label: 'START UP', value: 'START UP' },
  {
    label: 'Établissement Public à Caractère Industriel et Commercial (EPIC)',
    value: 'EPIC'
  }
]
export const FABRICATION_TYPES = ['Confection', 'Rénovation']
export const ORDER_TYPES = ['Radiateur', 'Faisceau', 'Autre']
export const COOLING_SYSTEMS_TYPES = ['Eau', 'Air', 'Huile']
export const COLLECTOR_MATERIALS_TYPES = ['Acier', 'Laiton']
export const PACKAGING_TYPES = ['Carton', 'Bois']
export const FINS_TYPES = [
  { label: 'Zigzag', value: 'Zigzag' },
  { label: 'Droite (Aérer)', value: 'Aérer' },
  { label: 'Droite (Normale)', value: 'Normale' }
]
export const FINS_SIZES = [10, 11, 12, 14]
export const TUBE_TYPES = [
  { label: 'Étiré 7 (ET7)', value: 'ET7' },
  { label: 'Étiré 9 (ET9)', value: 'ET9' },
  { label: 'Machine Petit (MP)', value: 'MP' }
]

export const CLAMPING_TYPES = ['Plié', 'Boulonné']
export const COLLECTOR_POSITION_TYPES = ['Centrer', 'Dépassée']
export const PAYMENT_TYPES = [
  'Espèces',
  'Versement',
  'Espèces + Versement',
  'Virement',
  'Cheque',
  'À terme'
]
export const BANK_TYPES = [
  { label: 'Banque Extérieure d’Algérie', value: 'BEA' },
  { label: 'Banque Nationale d’Algérie', value: 'BNA' },
  { label: 'Société Générale Algérie', value: 'SGA' },
  { label: 'Algerian Gulf Bank', value: 'AGB' }
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
