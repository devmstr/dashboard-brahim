import { OrderItem } from '@prisma/client'

const FINS_T = {
  Zigzag: 'Z',
  Aérer: 'A',
  Normale: 'D'
} as const

const TUBE_T = {
  ET7: '7',
  ET9: '9',
  MP: 'M'
} as const

const TIGHTENING_T = {
  Plié: 'P',
  Boulonné: 'B'
} as const

const POSITION_T = {
  Centrer: 'C',
  Dépassée: 'D'
} as const

export const coolingDec = {
  Air: 'TUR',
  Eau: 'EAU',
  Huile: 'HUI'
} as const

export type Fins = 'Normale' | 'Aérer' | 'Zigzag'
export type Tube = 'ET7' | 'ET9' | 'MP'
export type Tightening = 'Plié' | 'Boulonné'
export type Position = 'Centrer' | 'Dépassée'
export type Type = 'Radiateur' | 'Spirale' | 'Faisceau' | 'Autre'
export type Fabrication = 'Confection' | 'Rénovation'
export type Cooling = 'Eau' | 'Air' | 'Huile'

export interface ProductConfig {
  type?: string | null
  fabrication?: string | null
  cooling?: string | null
  fins?: string | null
  tubeType?: string | null
  pitch?: number | null
  tubeDiameter?: number | null
  rows?: number | null
  betweenCollectors?: number | null
  width?: number | null
  upperCollectorLength?: number | null
  upperCollectorWidth?: number | null
  lowerCollectorLength?: number | null
  lowerCollectorWidth?: number | null
  tightening?: string | null
  position?: string | null
  brand?: string | null
  model?: string | null
}

const pad = (n?: number | null): string =>
  (n?.toString() || '0').padStart(4, '0')

const formatDimension = (main?: number | null, lower?: number | null): string =>
  lower && lower !== main ? `${pad(main)}/${pad(lower)}` : pad(main)

const getPrefix = (
  type: Type,
  fabrication: OrderItem['fabrication'] = 'Confection'
): string =>
  type === 'Radiateur'
    ? fabrication === 'Confection'
      ? 'RAD'
      : 'REN'
    : type.slice(0, 3).toUpperCase()

export function generateLabel({
  type,
  fabrication,
  cooling = 'Eau',
  brand = '',
  model = '',
  betweenCollectors = 0,
  width,
  fins = 'Normale',
  tubeType = 'ET7',
  tubeDiameter = 16,
  pitch = 10,
  rows = 1,
  upperCollectorLength = 0,
  upperCollectorWidth = 0,
  lowerCollectorLength = 0,
  lowerCollectorWidth = 0,
  tightening = 'Plié',
  position = 'Centrer'
}: ProductConfig): string {
  const prefix = getPrefix(type as Type, fabrication as Fabrication)

  const core = `${pad(betweenCollectors)}X${pad(width!)}`
  const collectors = `${formatDimension(
    upperCollectorLength,
    lowerCollectorLength
  )}X${formatDimension(upperCollectorWidth, lowerCollectorWidth)}`
  const finsTube =
    type === 'Spirale'
      ? `T${tubeDiameter}`
      : `${FINS_T[fins as Fins]}${TUBE_T[tubeType as Tube]} ${pitch}`

  const coolingText =
    cooling !== 'Eau' ? ` ${coolingDec[cooling as Cooling]}` : ''
  const brandModel = `${brand} ${model}`.trim()

  return [
    prefix,
    core,
    `${rows}${finsTube}`,
    collectors,
    [
      TIGHTENING_T[tightening as Tightening],
      POSITION_T[position as Position]
    ].join(''),
    coolingText,
    brandModel
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
}
