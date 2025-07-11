// Constants.ts

// Company types
export const COMPANY_LABELS_TYPE = [
  { label: 'Monsieur', value: 'MR' },
  { label: 'Société Anonyme (SA)', value: 'SA' },
  { label: 'Société Par Actions (SPA)', value: 'SPA' },
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

export const COMPANY_LABELS_TYPE_ARR: string[] = COMPANY_LABELS_TYPE.map(
  (type) => type.value
)

// Fabrication
export const FABRICATION_TYPES = ['Confection', 'Rénovation'] as const
export const FABRICATION_TYPES_ARR: string[] = [...FABRICATION_TYPES]
export const STATUS_TYPES = [
  'Annuler',
  'Prévu',
  'Encours',
  'Fini',
  'Livré'
] as const
export const STATUS_TYPE_ARR: string[] = [...STATUS_TYPES]
// Orders
export const ORDER_TYPES = [
  'Radiateur',
  'Spirale',
  'Faisceau',
  'Autre'
] as const
export const ORDER_TYPES_ARR: string[] = [...ORDER_TYPES]

// Cooling Systems
export const COOLING_SYSTEMS_TYPES = ['Eau', 'Air', 'Huile'] as const
export const COOLING_SYSTEMS_TYPES_ARR: string[] = [...COOLING_SYSTEMS_TYPES]

// Collector Materials
export const COLLECTOR_MATERIALS_TYPES = ['Acier', 'Laiton'] as const
export const COLLECTOR_MATERIALS_TYPES_ARR: string[] = [
  ...COLLECTOR_MATERIALS_TYPES
]

// Packaging
export const PACKAGING_TYPES = ['Carton', 'Bois'] as const
export const PACKAGING_TYPES_ARR: string[] = [...PACKAGING_TYPES]

// Fins
export const FINS_TYPES = [
  { label: 'Zigzag', value: 'Zigzag' },
  { label: 'Droite (Aérer)', value: 'Aérer' },
  { label: 'Droite (Normale)', value: 'Normale' }
]

// Fins sizes
export const FINS_SIZES = [10, 11, 12, 14]

// Tubes
export const TUBE_TYPES = [
  { label: 'Étiré 7 (ET7)', value: 'ET7' },
  { label: 'Étiré 9 (ET9)', value: 'ET9' },
  { label: 'Machine Petit (MP)', value: 'MP' }
]

// Clamping
export const CLAMPING_TYPES = ['Plié', 'Boulonné'] as const
export const CLAMPING_TYPES_ARR: string[] = [...CLAMPING_TYPES]

// Collector Positions
export const COLLECTOR_POSITION_TYPES = ['Centrer', 'Dépassée'] as const
export const COLLECTOR_POSITION_TYPES_ARR: string[] = [
  ...COLLECTOR_POSITION_TYPES
]

// Payment
export const PAYMENT_TYPES = [
  'Espèces',
  'Versement',
  'Espèces + Versement',
  'Virement',
  'Cheque',
  'À terme'
] as const
export const PAYMENT_TYPES_ARR: string[] = [...PAYMENT_TYPES]

// Banks
export const BANK_TYPES = [
  { label: 'Banque Extérieure d’Algérie', value: 'BEA' },
  { label: 'Banque Nationale d’Algérie', value: 'BNA' },
  { label: 'Société Générale Algérie', value: 'SGA' },
  { label: 'Algerian Gulf Bank', value: 'AGB' }
]

// Perforation
export const PERFORATION_TYPES = ['Perforé', 'Non Perforé'] as const
export const PERFORATION_TYPES_ARR: string[] = [...PERFORATION_TYPES]

// Product Categories
export const CATEGORY_TYPES = [
  'Automobile',
  'Industriel',
  'Générateurs',
  'Agricole'
] as const
export const CATEGORY_TYPES_ARR: string[] = [...CATEGORY_TYPES]

// Car energy types
export const CAR_ENERGY_TYPES = ['Diesel', 'Essence'] as const
export const CAR_ENERGY_TYPES_ARR: string[] = [...CAR_ENERGY_TYPES]

// User roles
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
export const userRolesArr: string[] = [...userRoles]
