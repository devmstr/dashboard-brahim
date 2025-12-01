import {
  MaxRectsPacker,
  type IRectangle,
  type IOption as MaxRectsOptions
} from 'maxrects-packer'
import {
  MultiNestingInput,
  MultiNestingResult,
  MultiNestingSheet,
  MultiPositionedRectangle,
  MultiProductRectangle,
  NestingValidationError
} from './types'

function validateMultiNestingInput(input: MultiNestingInput): Required<
  Omit<MultiNestingInput, 'items'>
> & {
  items: Required<MultiProductRectangle>[]
} {
  const { sheetWidth, sheetHeight, allowRotation, padding, items } = input

  const numbers: Array<[string, number]> = [
    ['sheetWidth', sheetWidth],
    ['sheetHeight', sheetHeight]
  ]

  for (const [name, value] of numbers) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new NestingValidationError(
        `${name} must be a positive finite number.`
      )
    }
  }

  if (typeof allowRotation !== 'boolean') {
    throw new NestingValidationError('allowRotation must be a boolean.')
  }

  if (padding !== undefined && (!Number.isFinite(padding) || padding < 0)) {
    throw new NestingValidationError(
      'padding must be a non-negative finite number.'
    )
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new NestingValidationError('items must be a non-empty array.')
  }

  const normalizedItems: Required<MultiProductRectangle>[] = []

  for (const [idx, item] of items.entries()) {
    if (!item) {
      throw new NestingValidationError(`items[${idx}] is undefined/null.`)
    }

    const { productId, width, height, quantity } = item

    if (!productId || typeof productId !== 'string') {
      throw new NestingValidationError(
        `items[${idx}].productId must be a non-empty string.`
      )
    }

    if (!Number.isFinite(width) || width <= 0) {
      throw new NestingValidationError(
        `items[${idx}].width must be a positive finite number.`
      )
    }

    if (!Number.isFinite(height) || height <= 0) {
      throw new NestingValidationError(
        `items[${idx}].height must be a positive finite number.`
      )
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new NestingValidationError(
        `items[${idx}].quantity must be a positive integer.`
      )
    }

    normalizedItems.push({
      productId,
      width,
      height,
      quantity
    })
  }

  return {
    sheetWidth,
    sheetHeight,
    allowRotation,
    padding: padding ?? 0,
    items: normalizedItems
  }
}

/**
 * Nest multiple different bounding boxes across as many sheets as needed.
 *
 * This is suitable for:
 * - One production order with many products
 * - A whole month / 3 months of demand (just aggregate quantities in `items`)
 *
 * Important: This function does NOT cap the number of sheets. If you need a
 * defensive cap, implement it at the caller level by splitting huge periods.
 */
export function computeMultiShapeSheetNesting(
  input: MultiNestingInput
): MultiNestingResult {
  const { sheetWidth, sheetHeight, allowRotation, padding, items } =
    validateMultiNestingInput(input)

  const sheetArea = sheetWidth * sheetHeight

  // Flatten all items into individual rectangles.
  type FlatRect = IRectangle & {
    productId: string
    instanceIndex: number
  }

  const flatRects: FlatRect[] = []
  let totalRectangles = 0
  let totalRequestedArea = 0

  for (const item of items) {
    const { productId, width, height, quantity } = item
    const rectArea = width * height

    for (let i = 0; i < quantity; i++) {
      flatRects.push({
        x: 0,
        y: 0,
        width,
        height,
        productId,
        instanceIndex: i
      })
    }

    totalRectangles += quantity
    totalRequestedArea += rectArea * quantity
  }

  if (totalRectangles === 0) {
    return {
      sheetWidth,
      sheetHeight,
      sheetCount: 0,
      sheets: [],
      totalRectangles: 0,
      totalUsedArea: 0,
      totalArea: 0,
      globalUtilization: 0,
      wastePercentage: 100
    }
  }

  // Sort by area descending for better packing efficiency.
  flatRects.sort((a, b) => {
    const areaA = a.width * a.height
    const areaB = b.width * b.height
    return areaB - areaA
  })

  const options: MaxRectsOptions = {
    smart: true,
    pot: false,
    square: false,
    allowRotation
  }

  const packer = new MaxRectsPacker(
    sheetWidth,
    sheetHeight,
    padding,
    options
    // no maxBinCount -> unlimited sheets
  )

  packer.addArray(flatRects as any)

  const bins = packer.bins

  if (bins.length === 0) {
    // Nothing fit at all; treat as zero but keep totals consistent.
    return {
      sheetWidth,
      sheetHeight,
      sheetCount: 0,
      sheets: [],
      totalRectangles: 0,
      totalUsedArea: 0,
      totalArea: 0,
      globalUtilization: 0,
      wastePercentage: 100
    }
  }

  const sheets: MultiNestingSheet[] = []
  let totalUsedArea = 0
  let placedRectangles = 0

  bins.forEach((bin, binIndex) => {
    const binRects = bin.rects ?? []

    const positioned: MultiPositionedRectangle[] = binRects.map((r) => {
      const rect = r as unknown as FlatRect & { rot?: boolean }

      const rectArea = rect.width * rect.height
      totalUsedArea += rectArea
      placedRectangles += 1

      return {
        sheetIndex: binIndex,
        productId: rect.productId,
        instanceIndex: rect.instanceIndex,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        rotated: Boolean(rect.rot)
      }
    })

    const usedArea = positioned.reduce((sum, r) => sum + r.width * r.height, 0)
    const wasteArea = Math.max(sheetArea - usedArea, 0)
    const utilization = sheetArea === 0 ? 0 : usedArea / sheetArea

    sheets.push({
      sheetIndex: binIndex,
      rectangles: positioned,
      usedArea,
      wasteArea,
      utilization
    })
  })

  const sheetCount = sheets.length
  const totalArea = sheetArea * sheetCount
  const globalUtilization = totalArea === 0 ? 0 : totalUsedArea / totalArea
  const wastePercentage = totalArea === 0 ? 100 : (1 - globalUtilization) * 100

  // Sanity: if for some reason not all rectangles were placed, you can detect it here.
  if (placedRectangles !== totalRectangles) {
    // You can either throw, log, or just leave a warning comment.
    // For now, we keep it silent but you may want to turn this into an error
    // depending on how strict you want to be.
  }

  return {
    sheetWidth,
    sheetHeight,
    sheetCount,
    sheets,
    totalRectangles,
    totalUsedArea,
    totalArea,
    globalUtilization,
    wastePercentage
  }
}
