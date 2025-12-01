// lib/nesting/nest-rectangles.ts
import {
  MaxRectsPacker,
  type IRectangle,
  type IOption as MaxRectsOptions
} from 'maxrects-packer'
import {
  NestingInput,
  NestingDebugLayout,
  NestingResult,
  PositionedRectangle,
  NestingValidationError
} from './types'

/**
 * Validate numeric input and constraints.
 */
function validateInput(input: NestingInput): Required<NestingInput> {
  const {
    sheetWidth,
    sheetHeight,
    rectWidth,
    rectHeight,
    allowRotation,
    maxRects,
    padding
  } = input

  const numbers: Array<[string, number]> = [
    ['sheetWidth', sheetWidth],
    ['sheetHeight', sheetHeight],
    ['rectWidth', rectWidth],
    ['rectHeight', rectHeight]
  ]

  for (const [name, value] of numbers) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new NestingValidationError(
        `${name} must be a positive finite number.`
      )
    }
  }

  if (padding !== undefined && (!Number.isFinite(padding) || padding < 0)) {
    throw new NestingValidationError(
      'padding must be a non-negative finite number.'
    )
  }

  if (
    maxRects !== undefined &&
    (!Number.isInteger(maxRects) || maxRects <= 0)
  ) {
    throw new NestingValidationError(
      'maxRects must be a positive integer if provided.'
    )
  }

  return {
    sheetWidth,
    sheetHeight,
    rectWidth,
    rectHeight,
    allowRotation,
    maxRects: maxRects ?? Number.POSITIVE_INFINITY,
    padding: padding ?? 0
  }
}

/**
 * Compute theoretical max fit in a simple grid for a given orientation.
 * Used only for debug / visualization, NOT as a hard upper bound.
 */
function computeGridFit(
  sheetWidth: number,
  sheetHeight: number,
  rectWidth: number,
  rectHeight: number,
  padding: number
): { count: number; cols: number; rows: number } {
  if (rectWidth <= 0 || rectHeight <= 0) {
    return { count: 0, cols: 0, rows: 0 }
  }

  const cols = Math.floor((sheetWidth + padding) / (rectWidth + padding))
  const rows = Math.floor((sheetHeight + padding) / (rectHeight + padding))

  if (cols <= 0 || rows <= 0) {
    return { count: 0, cols: 0, rows: 0 }
  }

  return { count: cols * rows, cols, rows }
}

/**
 * Decide which single-orientation grid is denser (for debug grid only).
 * This no longer constrains the maximal count.
 */
function pickDebugGrid(
  sheetWidth: number,
  sheetHeight: number,
  rectWidth: number,
  rectHeight: number,
  padding: number,
  allowRotation: boolean
): { cols: number; rows: number } {
  const original = computeGridFit(
    sheetWidth,
    sheetHeight,
    rectWidth,
    rectHeight,
    padding
  )

  if (!allowRotation) {
    return { cols: original.cols, rows: original.rows }
  }

  const rotated = computeGridFit(
    sheetWidth,
    sheetHeight,
    rectHeight,
    rectWidth,
    padding
  )

  return rotated.count > original.count
    ? { cols: rotated.cols, rows: rotated.rows }
    : { cols: original.cols, rows: original.rows }
}

/**
 * Try to pack `count` identical rectangles using MaxRectsPacker into a single sheet.
 *
 * Returns whether all rectangles fit into exactly 1 bin and, if so, the rects.
 */
function tryPackCount(
  count: number,
  sheetWidth: number,
  sheetHeight: number,
  rectWidth: number,
  rectHeight: number,
  padding: number,
  allowRotation: boolean
): { ok: boolean; rects: IRectangle[] } {
  if (count === 0) {
    return { ok: true, rects: [] }
  }

  const options: MaxRectsOptions = {
    smart: true,
    pot: false,
    square: false,
    allowRotation
  }

  const packer = new MaxRectsPacker(sheetWidth, sheetHeight, padding, options)

  // Use original rectangle dimensions; let MaxRectsPacker decide per-rect rotation.
  const items: Array<IRectangle & { index: number }> = []
  for (let i = 0; i < count; i++) {
    items.push({
      x: 0,
      y: 0,
      width: rectWidth,
      height: rectHeight,
      index: i
    })
  }

  packer.addArray(items as any)

  if (packer.bins.length === 0) {
    return { ok: false, rects: [] }
  }

  const firstBin = packer.bins[0]
  const otherBins = packer.bins.slice(1)

  const rects = firstBin.rects ?? []

  const allInSingleBin = rects.length === count && otherBins.length === 0

  if (!allInSingleBin) {
    return { ok: false, rects: [] }
  }

  return { ok: true, rects }
}

/**
 * Binary search for the maximum N ≤ upperBound that fits into a single sheet.
 */
function findMaxFitWithPacker(
  upperBound: number,
  sheetWidth: number,
  sheetHeight: number,
  rectWidth: number,
  rectHeight: number,
  padding: number,
  allowRotation: boolean
): { maxCount: number; rects: IRectangle[] } {
  let low = 0
  let high = upperBound
  let bestCount = 0
  let bestRects: IRectangle[] = []

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const { ok, rects } = tryPackCount(
      mid,
      sheetWidth,
      sheetHeight,
      rectWidth,
      rectHeight,
      padding,
      allowRotation
    )

    if (ok) {
      bestCount = mid
      bestRects = rects
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  return { maxCount: bestCount, rects: bestRects }
}

/**
 * Build a simple debug grid (R / .) based on grid rows/cols and the count.
 * This does NOT reflect exact MaxRects coordinates; it's just a coarse occupancy view.
 */
function buildDebugGrid(
  rows: number,
  cols: number,
  count: number
): NestingDebugLayout | undefined {
  if (rows <= 0 || cols <= 0 || count <= 0) {
    return undefined
  }

  const grid: string[] = []
  let remaining = count

  for (let r = 0; r < rows; r++) {
    let row = ''
    for (let c = 0; c < cols; c++) {
      if (remaining > 0) {
        row += 'R'
        remaining -= 1
      } else {
        row += '.'
      }
    }
    grid.push(row)
  }

  return { grid }
}

/**
 * Main entry point: compute optimal layout for identical rectangles on a single sheet.
 *
 * Key changes vs previous version:
 * - Upper bound is based on AREA, not grid in a single orientation.
 * - Rectangles are always defined in original orientation; MaxRects handles rotation.
 * - This allows mixed 0° and 90° layouts (e.g., your 17-piece example).
 */
export function computeMaxFitForSingleShape(
  input: NestingInput
): NestingResult {
  const {
    sheetWidth,
    sheetHeight,
    rectWidth,
    rectHeight,
    allowRotation,
    maxRects,
    padding
  } = validateInput(input)

  const totalArea = sheetWidth * sheetHeight
  const rectArea = rectWidth * rectHeight

  if (rectArea > totalArea) {
    return {
      maxCount: 0,
      rectangles: [],
      wastePercentage: 100,
      usedArea: 0,
      totalArea,
      orientation: 'original',
      debugLayout: undefined
    }
  }

  // Theoretical maximum based purely on area.
  const areaUpperBound = Math.floor(totalArea / rectArea)
  if (areaUpperBound <= 0) {
    return {
      maxCount: 0,
      rectangles: [],
      wastePercentage: 100,
      usedArea: 0,
      totalArea,
      orientation: 'original',
      debugLayout: undefined
    }
  }

  // Real upper bound is the min of area-based and optional user-provided cap.
  const upperBound = Math.min(areaUpperBound, maxRects)

  const { maxCount, rects } = findMaxFitWithPacker(
    upperBound,
    sheetWidth,
    sheetHeight,
    rectWidth,
    rectHeight,
    padding,
    allowRotation
  )

  const usedArea = maxCount * rectArea
  const wasteArea = Math.max(totalArea - usedArea, 0)
  const wastePercentage = totalArea === 0 ? 0 : (wasteArea / totalArea) * 100

  const positioned: PositionedRectangle[] = rects.map((r, idx) => ({
    index: (r as any).index ?? idx,
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
    rotated: Boolean((r as any).rot)
  }))

  // Summarize orientation across all rects.
  let orientation: NestingResult['orientation'] = 'original'
  if (allowRotation && maxCount > 0) {
    const rotatedCount = positioned.filter((r) => r.rotated).length
    if (rotatedCount === 0) {
      orientation = 'original'
    } else if (rotatedCount === maxCount) {
      orientation = 'rotated'
    } else {
      orientation = 'mixed'
    }
  }

  // Coarse debug grid based on the best grid orientation (for visualization only).
  const debugGridDims = pickDebugGrid(
    sheetWidth,
    sheetHeight,
    rectWidth,
    rectHeight,
    padding,
    allowRotation
  )
  const debugLayout = buildDebugGrid(
    debugGridDims.rows,
    debugGridDims.cols,
    maxCount
  )

  return {
    maxCount,
    rectangles: positioned,
    wastePercentage,
    usedArea,
    totalArea,
    orientation,
    debugLayout
  }
}
