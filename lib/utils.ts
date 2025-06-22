import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import n2words from 'n2words'
import { BillingConfig, InvoiceItem, UserRole } from '@/types'
import { customAlphabet } from 'nanoid'
import { ORDER_TYPES, FABRICATION_TYPES } from '@/config/global'
import { Collector, Core, OrderItem } from './validations'
import { RSC_PREFETCH_SUFFIX } from 'next/dist/lib/constants'
import { Content } from '@tiptap/react'

export enum SKU_PREFIX {
  RA = 'RA', // radiator
  AR = 'AR', // order item
  RE = 'RE', // renovation (typeof radiator)
  FA = 'FA', // core (typeof radiator)
  AU = 'AU', // Other (typeof order item)
  CO = 'CO', // order
  CB = 'CB', // non confirmed order
  CL = 'CL', // client
  VE = 'VE', // model
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

interface Dimensions {
  width: number
  height: number
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

export type FinsPitch = '10' | '11' | '12' | '14'
export type FinsType = keyof typeof FINS_T
export type TubeType = keyof typeof TUBE_T
export type TighteningType = keyof typeof TIGHTENING_T
export type PositionType = keyof typeof POSITION_T

interface ProductConfig {
  type?: OrderItem['type']
  fabrication?: OrderItem['fabrication']
  core: {
    fins?: Core['fins']
    tube?: Core['tube']
    pitch?: Core['finsPitch']
    dimensions: Dimensions
    rows?: number
  }
  collectorTop: {
    tightening?: Collector['tightening']
    position?: Collector['position']
    dimensions: Dimensions
  }
  collectorBottom: {
    tightening?: Collector['tightening']
    position?: Collector['position']
    dimensions: Dimensions
  }
}

const pad = (n: number): string => n.toString().padStart(4, '0')

const formatDimension = (main: number, lower?: number): string =>
  lower && lower !== main ? `${pad(main)}/${pad(lower)}` : pad(main)

const getPrefix = (
  type: OrderItem['type'] = 'Radiateur',
  fabrication: OrderItem['fabrication'] = 'Confection'
): string =>
  type === 'Radiateur'
    ? fabrication === 'Confection'
      ? 'RAD'
      : 'REN'
    : type.slice(0, 3).toUpperCase()

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

export function generateRadiatorLabel({
  type,
  fabrication,
  core: {
    dimensions: coreDimensions,
    fins = 'Normale',
    tube = 'ET7',
    pitch = '10',
    rows = 1
  },
  collectorBottom: {
    dimensions: collector1Dimensions,
    tightening: tighteningBottom = 'Plié',
    position: positionBottom = 'Centrer'
  },
  collectorTop: {
    dimensions: collector2Dimensions,
    tightening: tighteningTop = 'Plié',
    position: positionTop = 'Centrer'
  }
}: ProductConfig): string {
  const prefix = getPrefix(type, fabrication)

  const core4DigitsDimensions = `${pad(coreDimensions.height)}X${pad(
    coreDimensions.width
  )}`

  const collector4DigitsDimensions = `${formatDimension(
    collector1Dimensions.height,
    collector2Dimensions.height
  )}X${formatDimension(collector1Dimensions.width, collector2Dimensions.width)}`

  // Position code logic: always two chars (e.g. C/C, C/P, etc.), unless both are the same, then one char (e.g. C, P, D)
  const pos1 = POSITION_T[positionBottom]
  const pos2 = POSITION_T[positionTop]
  const positionCode = pos1 === pos2 ? pos1 : `${pos1}/${pos2}`
  const tighteningB = TIGHTENING_T[tighteningBottom]
  const tighteningT = TIGHTENING_T[tighteningTop]
  const tighteningCode =
    tighteningB === tighteningT ? tighteningB : `${tighteningB}/${tighteningT}`

  return `${prefix} ${core4DigitsDimensions} ${rows}${FINS_T[fins]}${TUBE_T[tube]} ${pitch} ${collector4DigitsDimensions} ${positionCode} ${tighteningCode} `
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
  const Total = items.reduce((acc, item) => acc + item.amount, 0)

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
//   NL: 'NL',
//   TR: 'TR',
//   Aé: 'AERE'
// }

// export const TubeInSpreadSheet = {
//   ET7: '7',
//   ET9: '9',
//   'Mach-P': 'P'
// }

// export const FabricationInSpreadSheet = {
//   Con: 'RAD',
//   Fx: 'FAIS',
//   Rén: 'REN'
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
