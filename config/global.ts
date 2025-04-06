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
export const FINS_TYPES = ['Zigzag', 'Droite (Aérer)', 'Droite (Normale)']
export const FINS_SIZES = [10, 11, 12, 14]
export const TUBE_TYPES = [
  'Étiré 7 (ET7)',
  'Étiré 9 (ET9)',
  'Machine Petit (MP)'
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
