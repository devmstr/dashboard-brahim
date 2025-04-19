import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import n2words from 'n2words'
import { BillingConfig, InvoiceItem, UserRole } from '@/types'
import { Collector, Core } from '@prisma/client'
import { customAlphabet } from 'nanoid'

export enum SKU_PREFIX {
  RA = 'RA',
  FA = 'FA',
  AU = 'AU',
  CO = 'CO',
  CL = 'CL',
  VE = 'VE',
  PA = 'PA'
}

export type PREFIX = keyof typeof SKU_PREFIX

export function skuId(prefix: PREFIX): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const generateId = customAlphabet(alphabet, 6)
  const uniqueId = generateId()
  return `${prefix}X${uniqueId}`
}

interface Dimensions {
  width: number
  height: number
  lowerWidth?: number
  lowerHeight?: number
}

interface ProductConfig {
  type?: 'Faisceau' | 'Radiateur'
  fabrication?: 'Renovation' | 'Confection'
  core: Dimensions
  rows?: number
  fins?: 'Z' | 'A' | 'D'
  tube?: '7' | '9' | 'M'
  finsPitch?: 10 | 11 | 12 | 14
  collector: Dimensions
  tightening?: 'P' | 'B'
  position?: 'C' | 'D'
}

function pad(n: number): string {
  return n.toString().padStart(4, '0')
}

function formatDimension(main: number, lower?: number): string {
  return lower && lower !== main ? `${pad(main)}/${pad(lower)}` : pad(main)
}

function formatProductPrefix(type: string, fabrication: string): string {
  if (type === 'Faisceau') return 'FX'
  return fabrication === 'Confection' ? 'RA' : 'RE'
}

export function generateProductTitle({
  type = 'Radiateur',
  fabrication = 'Confection',
  core,
  collector,
  rows = 1,
  fins = 'D',
  tube = '7',
  finsPitch = 10,
  tightening = 'P',
  position = 'C'
}: ProductConfig): string {
  const coreCode = `${pad(core.height)}X${pad(core.width)}`
  const rowsPart = (rows > 1 && rows.toString()) || ''
  const rowFinsTubeCode = `${rowsPart}${fins}${tube}`
  const collectorCode = `${formatDimension(
    collector.height,
    collector.lowerHeight
  )}X${formatDimension(collector.width, collector.lowerWidth)}`

  return `${formatProductPrefix(
    type,
    fabrication
  )} ${coreCode} ${rowFinsTubeCode} ${finsPitch} ${collectorCode} ${tightening}${position}`
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

function consommation({
  fins,
  finPitch,
  rows,
  coreWidth,
  coreHeight,
  weight
}: {
  finPitch: number
  fins: 'AERE' | 'NL' | 'TR'
  rows: number
  coreWidth: number
  coreHeight: number
  weight: {
    fins: number
    tubes: number
    headers: number
    sidePlates: number
  }
}) {
  // Tube consumption
  const gutter = fins == 'TR' ? 20 : 10
  const tubeConsumption =
    ((coreWidth - gutter) / finPitch + 1) * rows * weight.tubes

  // Fins consumption
  let finsConsumption = 0
  if (fins == 'TR') {
    finsConsumption =
      ((coreWidth - 20) / finPitch + 1) *
      ((coreHeight - 20) / finPitch + 1) *
      weight.fins
  } else if (fins == 'NL') {
    finsConsumption = ((coreHeight - 20) / 3 + 1) * weight.fins
  } else {
    finsConsumption = (((coreHeight - 20) / 3 + 1) / 2) * weight.fins
  }

  // Headers consumption
  const headersConsumption =
    (coreWidth + 20) * (coreHeight + 20) * weight.headers

  // Side Plates (formerly faux joue) consumption
  const sidePlateConsumption = coreHeight * weight.sidePlates

  return {
    tubeConsumption,
    finsConsumption,
    headersConsumption,
    sidePlateConsumption
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// barcode logic

export type FinsType = 'TR' | 'NL' | 'AERE'
export type TubeType = 'MP' | 'MG' | 'E7' | 'E9'

export const FinsInSpreadSheet = {
  NL: 'NL',
  TR: 'TR',
  Aé: 'AERE'
}

export const TubeInSpreadSheet = {
  ET7: '7',
  ET9: '9',
  'Mach-P': 'P'
}

export const FabricationInSpreadSheet = {
  Con: 'RAD',
  Fx: 'FAIS',
  Rén: 'REN'
}

export const FINS_IN_DESCRIPTION = {
  TR: 'Z',
  NL: 'D',
  AERE: 'A'
}

export function coreToString({
  core,
  fabrication,
  fins,
  tube,
  finsPitch
}: {
  core: Partial<Core>
  fabrication: string
  fins: FinsType
  tube: TubeType
  finsPitch: number
}): string {
  return [
    `SONERAS, ${fabrication}:`,
    `${core.height?.toString().padStart(4, '0')} x ${core.width
      ?.toString()
      .padStart(4, '0')}`,
    core.rows && core.rows > 1 ? `${core.rows}R` : '',
    FINS_IN_DESCRIPTION[fins],
    tube,
    `PAS ${finsPitch}`
  ]
    .filter(Boolean)
    .join(' ')
}

export function collectorToString(collector: Omit<Collector, 'id'>): string {
  const formatDimension = (
    value: number,
    lowerValue: number | null,
    padLength: number
  ): string => {
    if (value !== lowerValue) {
      return `${value.toString().padStart(padLength, '0')}/${lowerValue
        ?.toString()
        .padStart(padLength, '0')}`
    }
    return value.toString().padStart(padLength, '0')
  }

  // Get the formatted height and width
  const collectorHeight = formatDimension(
    collector.height,
    collector.lowerHeight,
    4
  )
  const collectorWidth = formatDimension(
    collector.width,
    collector.lowerWidth,
    3
  )

  // Return the formatted string for the collector
  return `, COLL ${collectorHeight} x ${collectorWidth} ${collector.tightening} ${collector.position}`
}

export function descriptionAndLabelGenerator({
  core,
  fabrication,
  fins,
  tube,
  finsPitch,
  collector,
  brand,
  model
}: {
  core: Partial<Core>
  fabrication: string
  fins: FinsType
  tube: TubeType
  finsPitch: number
  collector?: Omit<Collector, 'id'>
  brand?: string
  model?: string
}): string {
  const coreSrt = coreToString({
    core,
    fabrication,
    fins,
    tube,
    finsPitch
  })
  let description = coreSrt

  if (collector) description += collectorToString(collector)

  if (brand?.trim() || model?.trim()) {
    // Construct the brand and model string in one go
    const brandAndModelStr = [
      brand?.trim() && `, ${brand.toUpperCase()}`,
      model?.trim() && ` ${model.toUpperCase()}`
    ]
      .filter(Boolean) // Remove any falsy values (empty strings)
      .join('') // Join the non-empty parts into a single string

    description += brandAndModelStr
  }

  return description
}
