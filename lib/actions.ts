// 'use server'
// import { customAlphabet } from 'nanoid'
// import { PAGE_LIMIT } from '@/constants'
// import { hash256, type HashDataType } from './hash-256'
// import * as XLSX from 'xlsx'
// import { type DataItem, generateXlsx } from './xls-generator'
// import prisma from '@/lib/db'
// import { Prisma, Radiator } from '@prisma/client'
// import {
//   TubeType,
//   FinsType,
//   descriptionAndLabelGenerator,
//   FabricationInSpreadSheet,
//   FinsInSpreadSheet,
//   TubeInSpreadSheet
// } from './utils'

// export type BarcodeItem = {
//   id: number
//   barcode: string | null
//   description: string
//   createdAt: Date | null
// }

// interface ImportedRadiator {
//   coreHeight: number
//   coreWidth: number
//   tube: TubeType
//   finsPitch: number
//   fins: FinsType
//   rows: number
//   collectorHeight?: number
//   collectorWidth?: number
//   position?: 'C' | 'D'
//   collectorLowerHeight?: number
//   collectorLowerWidth?: number
//   tightening?: 'P' | 'B'
//   fabrication: string
//   brand?: string
//   model?: string
// }

// export async function getBarcodeItemList(
//   search: string,
//   offset: number,
//   isValidated: boolean
// ): Promise<{
//   list: Pick<Radiator, 'id' | 'description' | 'barcode' | 'createdAt'>[]
//   offset: number
//   total: number
// }> {
//   const searchQuery = search
//     .toUpperCase()
//     .replace(/\b0+(\d+)/g, '$1') // Remove leading zeros from numbers
//     .trim() // Remove any leading or trailing spaces
//     .split(/\s+/) // Split by whitespace

//   const where = {
//     ...(search
//       ? {
//           OR: [
//             {
//               AND: searchQuery.map((word) => ({
//                 description: {
//                   contains: word
//                 }
//               }))
//             },
//             {
//               barcode: {
//                 contains: search
//               }
//             }
//           ]
//         }
//       : {}),
//     isValidated
//   }

//   const [totalBarcodes, barcodes] = await Promise.all([
//     prisma.radiator.count({ where }),
//     prisma.radiator.findMany({
//       where,
//       skip: offset,
//       take: PAGE_LIMIT,
//       orderBy: { createdAt: 'desc' }
//     })
//   ])

//   const newOffset = offset + PAGE_LIMIT

//   return {
//     list: barcodes,
//     offset: newOffset,
//     total: totalBarcodes
//   }
// }

// export async function searchRadiator(formData: FormData) {
//   const hashableData: HashDataType = {
//     fins: formData.get('fins') as string,
//     rows: formData.get('rows') as string,
//     coreHeight: formData.get('coreHeight') as string,
//     coreWidth: formData.get('coreWidth') as string,
//     collectorHeight: formData.get('collectorHeight') as string,
//     collectorWidth: formData.get('collectorWidth') as string,
//     finsPitch: null,
//     tube: null,
//     collectorPosition: null,
//     collectorTightening: null
//   }

//   const hash = hash256(hashableData)

//   const radiator = await prisma.radiator.findUnique({
//     where: { hash }
//   })

//   return radiator?.barcode
// }

// export async function createRadiatorWithComponents({
//   coreHeight,
//   coreWidth,
//   tube,
//   finsPitch,
//   fins,
//   rows,
//   collectorHeight,
//   collectorWidth,
//   position,
//   collectorLowerHeight,
//   collectorLowerWidth,
//   tightening,
//   fabrication,
//   brand,
//   model
// }: ImportedRadiator) {
//   const hashableData: HashDataType = {
//     fins,
//     rows: String(rows),
//     coreHeight: String(coreHeight),
//     coreWidth: String(coreWidth),
//     collectorHeight: String(collectorHeight),
//     collectorWidth: String(collectorWidth),
//     finsPitch: String(finsPitch),
//     tube: String(tube),
//     collectorPosition: String(position),
//     collectorTightening: String(tightening)
//   }

//   const hash = hash256(hashableData)

//   const existingRadiator = await prisma.radiator.findUnique({
//     where: { hash }
//   })

//   if (existingRadiator) return

//   const description = descriptionAndLabelGenerator({
//     fabrication,
//     fins,
//     tube,
//     finsPitch,
//     brand,
//     model,
//     core: {
//       height: coreHeight,
//       width: coreWidth,
//       tube,
//       finsPitch,
//       fins,
//       rows
//     },
//     collector: {
//       height: collectorHeight!,
//       width: collectorWidth!,
//       position: String(position),
//       lowerHeight: collectorLowerHeight || collectorHeight!,
//       lowerWidth: collectorLowerWidth || collectorWidth!,
//       tightening: String(tightening)
//     }
//   })

//   return await prisma.radiator.create({
//     data: {
//       description,
//       dirId: 'need to implement dirId function',
//       brand,
//       model,
//       hash,
//       core: {
//         create: {
//           height: coreHeight,
//           width: coreWidth,
//           tube,
//           finsPitch,
//           fins,
//           rows
//         }
//       },
//       ...(collectorHeight && collectorWidth
//         ? {
//             collector: {
//               create: {
//                 height: collectorHeight,
//                 width: collectorWidth,
//                 position: String(position),
//                 lowerHeight: collectorLowerHeight || collectorHeight,
//                 lowerWidth: collectorLowerWidth || collectorWidth,
//                 tightening: String(tightening)
//               }
//             }
//           }
//         : {})
//     }
//   })
// }

// export async function addNewRadiator(formData: FormData) {
//   try {
//     const coreHeight = Number(formData.get('coreHeight'))
//     const coreWidth = Number(formData.get('coreWidth'))
//     const collectorHeight = Number(formData.get('collectorHeight'))
//     const collectorWidth = Number(formData.get('collectorWidth'))
//     const fins = formData.get('fins') as FinsType
//     const rows = Number(formData.get('rows'))
//     const position = formData.get('collectorPosition') as string
//     const tube = formData.get('tube') as TubeType
//     const lowerHeight = Number(
//       formData.get('collectorLowerHeight') || collectorHeight
//     )
//     const upperWidth = Number(
//       formData.get('collectorLowerWidth') || collectorWidth
//     )
//     const tightening = formData.get('collectorTightening') as string
//     const finsPitch = Number(formData.get('finsPitch'))
//     const brand = formData.get('brand') as string
//     const model = formData.get('model') as string
//     const fabrication = formData.get('fabrication') as string

//     return await createRadiatorWithComponents({
//       coreHeight,
//       coreWidth,
//       tube,
//       finsPitch,
//       fins,
//       rows,
//       collectorHeight,
//       collectorWidth,
//       position: position as 'C' | 'D',
//       collectorLowerHeight: lowerHeight,
//       collectorLowerWidth: upperWidth,
//       tightening: tightening as 'P' | 'B',
//       fabrication,
//       brand,
//       model
//     })
//   } catch (error) {
//     console.error('Error adding new radiator:', error)
//     throw new Error('Failed to add new radiator')
//   }
// }

// export async function generateGS1File(data: DataItem[]): Promise<string> {
//   try {
//     const workbook = await generateXlsx(data)
//     const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
//     return Buffer.from(buffer).toString('base64')
//   } catch (error) {
//     console.error('Error in generateGS1File:', error)
//     throw new Error('Failed to generate GS1 file')
//   }
// }

// export async function isRadiatorDimensionsExist(
//   height: number,
//   width: number,
//   collectorHeight: number,
//   collectorWidth: number
// ) {
//   const existingRadiator = await prisma.radiator.findFirst({
//     where: {
//       core: { height, width },
//       collector: { height: collectorHeight, width: collectorWidth }
//     }
//   })

//   return !!existingRadiator
// }

// export async function isCoreDimensionsExist(
//   height: number,
//   width: number,
//   rows: number
// ) {
//   const isCoreExist = await prisma.core.findFirst({
//     where: { height, width, rows }
//   })

//   return !!isCoreExist
// }

// export async function validateRadiator(radiatorId: string, ean13: string) {
//   try {
//     await prisma.radiator.update({
//       where: { id: radiatorId },
//       data: { barcode: ean13, isValidated: true }
//     })
//   } catch (error) {
//     console.error('Error validating radiator:', error)
//     throw new Error('Failed to validate radiator')
//   }
// }

// export async function deleteRadiator(radiatorId: string) {
//   try {
//     await prisma.radiator.delete({
//       where: { id: radiatorId }
//     })
//   } catch (error) {
//     console.error('Error deleting radiator:', error)
//     throw new Error('Failed to delete radiator')
//   }
// }

// export async function importRadiatorsFromXLSX(
//   formData: FormData
// ): Promise<{ success: boolean; message: string }> {
//   let newRadiatorsCount = 0
//   let existingRadiatorsCount = 0
//   let errorCount = 0

//   try {
//     const file = formData.get('file') as File
//     if (!file) {
//       throw new Error('No file provided')
//     }

//     const arrayBuffer = await file.arrayBuffer()
//     const workbook = XLSX.read(arrayBuffer, { type: 'array' })
//     const worksheet = workbook.Sheets[workbook.SheetNames[0]]
//     const data = XLSX.utils.sheet_to_json(worksheet, {
//       header: 1
//     }) as string[][]

//     const radiators: ImportedRadiator[] = data.slice(3).map((row) => ({
//       fabrication:
//         FabricationInSpreadSheet[
//           row[0] as keyof typeof FabricationInSpreadSheet
//         ],
//       brand: row[1] || undefined,
//       model: row[2] || undefined,
//       coreHeight: Number(row[3]),
//       coreWidth: Number(row[4]),
//       rows: Number(row[5]),
//       fins: FinsInSpreadSheet[
//         row[6] as keyof typeof FinsInSpreadSheet
//       ] as FinsType,
//       finsPitch: Number(row[7]) ?? 0,
//       tube: TubeInSpreadSheet[
//         row[8] as keyof typeof TubeInSpreadSheet
//       ] as TubeType,
//       collectorHeight: Number(row[9]),
//       collectorWidth: Number(row[10]),
//       collectorLowerHeight: Number(row[11]),
//       collectorLowerWidth: Number(row[12]),
//       position: String(row[13]).at(0) as 'C' | 'D',
//       tightening: String(row[14]).at(0) as 'P' | 'B'
//     }))

//     for (const radiator of radiators) {
//       try {
//         await createRadiatorWithComponents(radiator)
//         newRadiatorsCount++
//       } catch (error) {
//         if (error instanceof Prisma.PrismaClientKnownRequestError) {
//           existingRadiatorsCount++
//         } else {
//           console.error('Error processing radiator:', error)
//         }
//         errorCount++
//       }
//     }

//     return {
//       success: true,
//       message: `Importation terminée. ${newRadiatorsCount} nouveaux radiateurs ajoutés. ${existingRadiatorsCount} radiateurs existaient déjà. ${errorCount} radiateurs n'ont pas pu être importés.`
//     }
//   } catch (error) {
//     console.error('Error importing radiators:', error)
//     return {
//       success: false,
//       message:
//         'Failed to import radiators. Please check the file format and try again.'
//     }
//   }
// }

// interface IValidationRecord {
//   barcode: string
//   description: string
// }

// export async function importGs1ValidationFromXLSX(
//   formData: FormData
// ): Promise<{ success: boolean; message: string }> {
//   let validatedCount = 0
//   let errorCount = 0

//   try {
//     const file = formData.get('file') as File
//     if (!file) {
//       return { success: false, message: 'Aucun fichier fourni.' }
//     }

//     const arrayBuffer = await file.arrayBuffer()
//     const workbook = XLSX.read(arrayBuffer, { type: 'array' })
//     const worksheet = workbook.Sheets[workbook.SheetNames[0]]
//     const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (
//       | string
//       | number
//     )[][]

//     if (data.length === 0) {
//       return { success: false, message: 'Le fichier est vide ou mal formaté.' }
//     }

//     const barcodeRegex = /^\d{13}$/
//     const validations: IValidationRecord[] = data
//       .map((row) => {
//         // Ensure all row values are strings
//         const sanitizedRow = row.map((cell) =>
//           typeof cell === 'string' ? cell.trim() : String(cell)
//         )

//         const barcode = sanitizedRow.filter((r) => barcodeRegex.test(r)).at(0) // This may return undefined

//         if (!barcode) return null

//         const description = sanitizedRow
//           .reduce(
//             (max, curr) => (curr.length > max.length ? curr : max),
//             sanitizedRow[0]
//           )
//           .replace(/[\n\t\r\f\v]+/g, ' ')

//         return barcode && description ? { barcode, description } : null
//       })
//       .filter((record): record is IValidationRecord => record !== null)

//     let invalidRowsCount = validations.length

//     for (const { description, barcode } of validations) {
//       try {
//         const dbRecord = await prisma.radiator.findMany({
//           where: {
//             isValidated: false,
//             description
//           }
//         })

//         if (dbRecord.length < 2 && barcode) {
//           await prisma.radiator.update({
//             where: { id: dbRecord.at(0)?.id },
//             data: { barcode, isValidated: true }
//           })
//           validatedCount++
//           invalidRowsCount--
//           continue
//         }
//       } catch (error) {
//         console.error(
//           `Erreur lors du traitement du radiateur (${description}):`,
//           error
//         )
//         errorCount++
//       }
//     }

//     return {
//       success: true,
//       message: `Validation terminée. ${validatedCount} radiateur(s) validé(s) avec succès. ${invalidRowsCount} lignes invalides (EAN-13 incorrect ou description trop courte). ${errorCount} enregistrements n'ont pas pu être importés. ${
//         validatedCount - invalidRowsCount
//       } enregistrements manquants.`
//     }
//   } catch (error) {
//     console.error("Erreur lors de l'importation des radiateurs:", error)
//     return {
//       success: false,
//       message:
//         "Échec de l'importation des radiateurs. Vérifiez le format du fichier et réessayez."
//     }
//   }
// }
