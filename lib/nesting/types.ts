/**
 * One product's bounding-box definition + quantity.
 */
export interface MultiProductRectangle {
  productId: string
  width: number
  height: number
  quantity: number
}

/**
 * Input for multi-bounding-box, multi-sheet nesting.
 */
export interface MultiNestingInput {
  sheetWidth: number
  sheetHeight: number
  allowRotation: boolean
  /**
   * Padding between rectangles and to sheet borders.
   */
  padding?: number
  /**
   * Mixed list of products and their quantities.
   */
  items: MultiProductRectangle[]
}

/**
 * Positioned rectangle that belongs to a given product and sheet.
 */
export interface MultiPositionedRectangle {
  sheetIndex: number
  productId: string
  /**
   * 0-based global index of this rectangle among all copies of this product.
   * (Useful if you need to track specific pieces.)
   */
  instanceIndex: number
  x: number
  y: number
  width: number
  height: number
  rotated: boolean
}

/**
 * Per-sheet aggregation.
 */
export interface MultiNestingSheet {
  sheetIndex: number
  rectangles: MultiPositionedRectangle[]
  usedArea: number
  wasteArea: number
  utilization: number // usedArea / (sheetArea)
}

/**
 * Result of multi-product nesting over multiple sheets.
 */
export interface MultiNestingResult {
  sheetWidth: number
  sheetHeight: number
  sheetCount: number
  sheets: MultiNestingSheet[]
  totalRectangles: number
  totalUsedArea: number
  totalArea: number
  globalUtilization: number // totalUsedArea / totalArea
  wastePercentage: number // 100 - globalUtilization * 100
}

/**
 * Input parameters for identical-rectangle nesting.
 */
export interface NestingInput {
  sheetWidth: number
  sheetHeight: number
  rectWidth: number
  rectHeight: number
  allowRotation: boolean
  /**
   * Optional upper bound on how many rectangles to try to place.
   */
  maxRects?: number
  /**
   * Padding between rectangles (and effectively to sheet borders), in same units as dimensions.
   * Default: 0
   */
  padding?: number
}

/**
 * Single positioned rectangle on the sheet.
 */
export interface PositionedRectangle {
  index: number
  x: number
  y: number
  width: number
  height: number
  rotated: boolean
}

/**
 * Debug layout representation (coarse grid).
 */
export interface NestingDebugLayout {
  /**
   * Array of strings, one per row.
   * 'R' = rectangle cell, '.' = empty.
   */
  grid: string[]
}

/**
 * Result of a nesting computation.
 */
export interface NestingResult {
  maxCount: number
  rectangles: PositionedRectangle[]
  wastePercentage: number
  usedArea: number
  totalArea: number
  /**
   * Orientation summary:
   * - 'original'  => no rectangles were rotated
   * - 'rotated'   => all rectangles were rotated
   * - 'mixed'     => mixture of both orientations
   */
  orientation: 'original' | 'rotated' | 'mixed'
  /**
   * Optional ASCII-style grid layout, for debugging.
   * (Coarse approximation only, not an exact map of coordinates.)
   */
  debugLayout?: NestingDebugLayout
}

/**
 * Error thrown when input validation fails.
 */
export class NestingValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NestingValidationError'
  }
}
