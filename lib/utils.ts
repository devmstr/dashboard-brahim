import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import n2words from 'n2words'
import { BillingConfig, InvoiceItem, UserRole } from '@/types'
import { customAlphabet } from 'nanoid'
import { OrderItem } from './validations'
import { Content } from '@tiptap/react'

export enum SKU_PREFIX {
  RA = 'RA', // radiator
  RE = 'RE', // Radiateur renovation (typeof radiator)
  FA = 'FA', // Faisceau
  FE = 'FE', // Faisceau Empalé
  SP = 'SP', // Spirale
  MO = 'MO', // model
  BR = 'BR', // brand
  AR = 'AR', // order item (article)
  AU = 'AU', // Other (typeof order item)
  CO = 'CO', // order
  CB = 'CB', // non confirmed order
  CL = 'CL', // client
  PA = 'PA', // payment
  FP = 'FP', // facture proforma
  FF = 'FF', // facture final
  FL = 'FL' // file
}

export type PREFIX = keyof typeof SKU_PREFIX

export function skuId(prefix: PREFIX): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWYZ123456789'
  const generateId = customAlphabet(alphabet, 6)
  const uniqueId = generateId()
  return `${prefix}X${uniqueId}`
}

// Function to get file extension
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

// Function to generate a unique filename with SKU ID
export function generateUniqueFilename(originalFilename: string): string {
  const extension = getFileExtension(originalFilename)
  const uniqueId = skuId('FL')
  return `${uniqueId}.${extension}`
}

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

interface ProductConfig {
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

export function generateRadiatorLabel({
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
    TIGHTENING_T[tightening as Tightening],
    POSITION_T[position as Position],
    coolingText,
    brandModel
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
}

export const formatPhoneNumber = (phone: string | null | undefined) => {
  if (!phone) return ''
  // remove the country code
  let cleanedPhone = phone.replace(/[^0-9]/g, '')
  // add the leading zero if it doesn't exist
  const hasLeadingZero = cleanedPhone.startsWith('0')
  const hasCountryCode = cleanedPhone.startsWith('213')
  const hasPlus = cleanedPhone.startsWith('+')
  const hasValidLength = cleanedPhone.length === 9 || cleanedPhone.length === 10
  if (!hasLeadingZero && !hasCountryCode && !hasPlus && hasValidLength) {
    cleanedPhone = '0' + cleanedPhone
  } else if (hasCountryCode) {
    cleanedPhone = cleanedPhone.replace('213', '0')
  } else if (hasPlus) {
    cleanedPhone = cleanedPhone.replace('+213', '0')
  }

  // if phone number is 10 digits, format it as 0X XX XX XX XX
  if (cleanedPhone.length === 10) {
    return cleanedPhone.replace(
      /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/,
      '$1 $2 $3 $4 $5'
    )
  }
  // if phone number is 9 digits, format it as 0X XX XX XX
  return cleanedPhone.replace(/(\d{3})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4')
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export function toKebabCase(str: string): string {
  if (!str) return str
  return str
    .trim()
    .replace(/[\s\.\-]+/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
}

export function toCapitalize(str: string): string {
  if (!str) return str
  return str
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// check user role
export const hasUserRole = (userRole: UserRole, roles: UserRole[]): boolean => {
  return userRole === 'ADMIN' || roles.includes(userRole)
}

// to screaming snake case
export function toScreamingSnakeCase(str: string): string {
  if (!str) return str
  return str
    .trim()
    .replace(/\.|\-/g, '_')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toUpperCase()
}

export const parseMetadata = (meta: any) => {
  if (!meta) return undefined
  if (typeof meta === 'object') return meta
  try {
    return JSON.parse(meta)
  } catch {
    return undefined
  }
}

export const dateDiff = (startDate: string, endDate: string) => {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  return Math.round((end - start) / (1000 * 60 * 60 * 24))
}

export function calculateBillingSummary(
  items: InvoiceItem[],
  config: BillingConfig = {}
) {
  // Sum up all item amounts to get totalHT.
  const Total = items.reduce((acc, item) => acc + (item.price ?? 0), 0)

  // Use provided rates or defaults.
  const discountRate = config.discountRate ?? 0 // default 3%
  const refundRate = config.refundRate ?? 0 // default 0 if not provided
  const vatRate = config.vatRate ?? 0.19 // always 19%
  const stampTaxRate = config.stampTaxRate ?? 0 // always 1%
  // Calculate each component.
  const discount = Total * discountRate
  // Total HT equal Total.H.T A/DED minus remise and rg
  const totalAfterDiscount = Total - discount
  const refund = totalAfterDiscount * refundRate
  const totalHT = totalAfterDiscount - refund
  // TVA
  const vat = totalHT * vatRate
  // Timbre is 1% of totalHT
  const stampTax = (totalHT + vat) * stampTaxRate
  // Total TTC is the net amount plus TVA and timbre.
  const totalTTC = totalHT + vat + stampTax

  return {
    Total,
    totalHT,
    discount,
    refund,
    vat,
    stampTax,
    totalTTC
  }
}

export function amountToWords(amount: number): string {
  const dinars = Math.floor(amount)
  const centimes = Math.round((amount - dinars) * 100)

  const dinarsInWords = dinars === 0 ? 'zéro' : n2words(dinars, { lang: 'fr' })
  const centimesInWords =
    centimes === 0 ? 'zéro' : n2words(centimes, { lang: 'fr' })

  return `${dinarsInWords} dinars Algériens et ${centimesInWords} centimes`
}

export function isContentEmpty(note: Content): boolean {
  if (note === null) return true

  if (typeof note === 'string') {
    return note.trim() === ''
  }

  if (Array.isArray(note)) {
    return note.length === 0 || note.every(isContentEmpty)
  }

  // It's a single JSONContent object
  if (typeof note === 'object') {
    const hasText = typeof note.text === 'string' && note.text.trim() !== ''
    const hasChildren =
      Array.isArray(note.content) &&
      note.content.some((child) => !isContentEmpty(child))
    return !hasText && !hasChildren
  }

  return true
}

// function consommation({
//   fins,
//   finPitch,
//   rows,
//   coreWidth,
//   coreHeight,
//   weight
// }: {
//   finPitch: number
//   fins: 'AERE' | 'NL' | 'TR'
//   rows: number
//   coreWidth: number
//   coreHeight: number
//   weight: {
//     fins: number
//     tubes: number
//     headers: number
//     sidePlates: number
//   }
// }) {
//   // Tube consumption
//   const gutter = fins == 'TR' ? 20 : 10
//   const tubeConsumption =
//     ((coreWidth - gutter) / finPitch + 1) * rows * weight.tubes

//   // Fins consumption
//   let finsConsumption = 0
//   if (fins == 'TR') {
//     finsConsumption =
//       ((coreWidth - 20) / finPitch + 1) *
//       ((coreHeight - 20) / finPitch + 1) *
//       weight.fins
//   } else if (fins == 'NL') {
//     finsConsumption = ((coreHeight - 20) / 3 + 1) * weight.fins
//   } else {
//     finsConsumption = (((coreHeight - 20) / 3 + 1) / 2) * weight.fins
//   }

//   // Headers consumption
//   const headersConsumption =
//     (coreWidth + 20) * (coreHeight + 20) * weight.headers

//   // Side Plates (formerly faux joue) consumption
//   const sidePlateConsumption = coreHeight * weight.sidePlates

//   return {
//     tubeConsumption,
//     finsConsumption,
//     headersConsumption,
//     sidePlateConsumption
//   }
// }

// export function debounce<T extends (...args: any[]) => any>(
//   func: T,
//   wait: number
// ): (...args: Parameters<T>) => void {
//   let timeout: NodeJS.Timeout | null = null

//   return (...args: Parameters<T>) => {
//     if (timeout) clearTimeout(timeout)
//     timeout = setTimeout(() => func(...args), wait)
//   }
// }

// // barcode logic

// export type FinsType = 'TR' | 'NL' | 'AERE'
// export type TubeType = 'MP' | 'MG' | 'E7' | 'E9'

// export const FinsInSpreadSheet = {
//   NL: 'Normale',
//   TR: 'Zigzag',
//   Aé: 'Aérer'
// }

// export const TubeInSpreadSheet = {
//   ET7: 'ET7',
//   ET9: 'ET9',
//   'Mach-P': 'MP'
// }

// export const FabricationInSpreadSheet = {
//   Con: 'RAD',
//   Fx: 'FAIS',
//   Rén: 'REN'
// }

// export const TighteningTypeInSpreadSheet = {
//   PLi: 'Plié',
//   BL: 'Boulonné'
// }

// export const FINS_IN_DESCRIPTION = {
//   TR: 'Z',
//   NL: 'D',
//   AERE: 'A'
// }

// export function coreToString({
//   core,
//   fabrication,
//   fins,
//   tube,
//   finsPitch
// }: {
//   core: Partial<Core>
//   fabrication: string
//   fins: FinsType
//   tube: TubeType
//   finsPitch: number
// }): string {
//   return [
//     `SONERAS, ${fabrication}:`,
//     `${core.height?.toString().padStart(4, '0')} x ${core.width
//       ?.toString()
//       .padStart(4, '0')}`,
//     core.rows && core.rows > 1 ? `${core.rows}R` : '',
//     FINS_IN_DESCRIPTION[fins],
//     tube,
//     `PAS ${finsPitch}`
//   ]
//     .filter(Boolean)
//     .join(' ')
// }

// export function collectorToString(collector: Omit<Collector, 'id'>): string {
//   const formatDimension = (
//     value: number,
//     lowerValue: number | null,
//     padLength: number
//   ): string => {
//     if (value !== lowerValue) {
//       return `${value.toString().padStart(padLength, '0')}/${lowerValue
//         ?.toString()
//         .padStart(padLength, '0')}`
//     }
//     return value.toString().padStart(padLength, '0')
//   }

//   // Get the formatted height and width
//   const collectorHeight = formatDimension(
//     collector.height,
//     collector.lowerHeight,
//     4
//   )
//   const collectorWidth = formatDimension(
//     collector.width,
//     collector.lowerWidth,
//     3
//   )

//   // Return the formatted string for the collector
//   return `, COLL ${collectorHeight} x ${collectorWidth} ${collector.tightening} ${collector.position}`
// }

// export function descriptionAndLabelGenerator({
//   core,
//   fabrication,
//   fins,
//   tube,
//   finsPitch,
//   collector,
//   brand,
//   model
// }: {
//   core: Partial<Core>
//   fabrication: string
//   fins: FinsType
//   tube: TubeType
//   finsPitch: number
//   collector?: Omit<Collector, 'id'>
//   brand?: string
//   model?: string
// }): string {
//   const coreSrt = coreToString({
//     core,
//     fabrication,
//     fins,
//     tube,
//     finsPitch
//   })
//   let description = coreSrt

//   if (collector) description += collectorToString(collector)

//   if (brand?.trim() || model?.trim()) {
//     // Construct the brand and model string in one go
//     const brandAndModelStr = [
//       brand?.trim() && `, ${brand.toUpperCase()}`,
//       model?.trim() && ` ${model.toUpperCase()}`
//     ]
//       .filter(Boolean) // Remove any falsy values (empty strings)
//       .join('') // Join the non-empty parts into a single string

//     description += brandAndModelStr
//   }

//   return description
// }
