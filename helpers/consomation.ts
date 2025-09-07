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
