// analytic-rect-packing-free.ts
// Exact optimal orthogonal packing for identical rectangles with grid-based
// free-space decomposition that maximizes merged wasted rectangles.

import {
  PlacedPiece,
  WasteRectangle,
  RectPackingInput,
  RectPackingOutput
} from './types'

/* ============================================================================
   PART 1 — Utility
============================================================================ */

function capacity1D(available: number, size: number, spacing: number): number {
  if (available <= 0 || size <= 0) return 0
  if (available < size) return 0
  return Math.max(0, Math.floor((available + spacing) / (size + spacing)))
}

/* ============================================================================
   PART 2 — Row & Column analytic solver
============================================================================ */

interface PatternResult {
  pieces: number
  rowsOrCols: number
  normalCount: number
  rotatedCount: number
}

// Mix by rows
function solveRowMixing(
  effW: number,
  effH: number,
  wN: number,
  hN: number,
  wR: number,
  hR: number,
  spacingX: number,
  spacingY: number
): PatternResult {
  const capRowN = capacity1D(effW, wN, spacingX)
  const capRowR = capacity1D(effW, wR, spacingX)

  if (capRowN === 0 && capRowR === 0) {
    return { pieces: 0, rowsOrCols: 0, normalCount: 0, rotatedCount: 0 }
  }

  const A = hN + spacingY
  const B = hR + spacingY
  const C = effH + spacingY

  const maxN = capRowN > 0 ? Math.floor(C / A) : 0
  const maxR = capRowR > 0 ? Math.floor(C / B) : 0

  let best = 0
  let bestN = 0
  let bestR = 0

  for (let rN = 0; rN <= maxN; rN++) {
    const rem = C - rN * A
    if (rem < 0) continue

    let rR = capRowR > 0 ? Math.floor(rem / B) : 0
    if (rR > maxR) rR = maxR

    const rows = rN + rR
    if (rows === 0) continue

    const totalH = rN * hN + rR * hR + (rows - 1) * spacingY
    if (totalH > effH + 1e-9) continue

    const pieces = rN * capRowN + rR * capRowR
    if (pieces > best) {
      best = pieces
      bestN = rN
      bestR = rR
    }
  }

  return {
    pieces: best,
    rowsOrCols: bestN + bestR,
    normalCount: bestN,
    rotatedCount: bestR
  }
}

// Mix by columns
function solveColumnMixing(
  effW: number,
  effH: number,
  wN: number,
  hN: number,
  wR: number,
  hR: number,
  spacingX: number,
  spacingY: number
): PatternResult {
  const capColN = capacity1D(effH, hN, spacingY)
  const capColR = capacity1D(effH, hR, spacingY)

  if (capColN === 0 && capColR === 0) {
    return { pieces: 0, rowsOrCols: 0, normalCount: 0, rotatedCount: 0 }
  }

  const A = wN + spacingX
  const B = wR + spacingX
  const C = effW + spacingX

  const maxN = capColN > 0 ? Math.floor(C / A) : 0
  const maxR = capColR > 0 ? Math.floor(C / B) : 0

  let best = 0
  let bestN = 0
  let bestR = 0

  for (let cN = 0; cN <= maxN; cN++) {
    const rem = C - cN * A
    if (rem < 0) continue

    let cR = capColR > 0 ? Math.floor(rem / B) : 0
    if (cR > maxR) cR = maxR

    const cols = cN + cR
    if (cols === 0) continue

    const totalW = cN * wN + cR * wR + (cols - 1) * spacingX
    if (totalW > effW + 1e-9) continue

    const pieces = cN * capColN + cR * capColR
    if (pieces > best) {
      best = pieces
      bestN = cN
      bestR = cR
    }
  }

  return {
    pieces: best,
    rowsOrCols: bestN + bestR,
    normalCount: bestN,
    rotatedCount: bestR
  }
}

/* ============================================================================
   PART 3 — Build the actual placement geometry
============================================================================ */

function buildRowLayout(
  effW: number,
  marginX: number,
  marginY: number,
  wN: number,
  hN: number,
  wR: number,
  hR: number,
  spacingX: number,
  spacingY: number,
  result: PatternResult
): PlacedPiece[] {
  const capRowN = capacity1D(effW, wN, spacingX)
  const capRowR = capacity1D(effW, wR, spacingX)

  let y = marginY
  const pieces: PlacedPiece[] = []

  for (let i = 0; i < result.normalCount; i++) {
    let x = marginX
    for (let j = 0; j < capRowN; j++) {
      pieces.push({ x, y, width: wN, height: hN, rotated: false })
      x += wN + spacingX
    }
    y += hN + spacingY
  }

  for (let i = 0; i < result.rotatedCount; i++) {
    let x = marginX
    for (let j = 0; j < capRowR; j++) {
      pieces.push({ x, y, width: wR, height: hR, rotated: true })
      x += wR + spacingX
    }
    y += hR + spacingY
  }

  return pieces
}

function buildColumnLayout(
  effH: number,
  marginX: number,
  marginY: number,
  wN: number,
  hN: number,
  wR: number,
  hR: number,
  spacingX: number,
  spacingY: number,
  result: PatternResult
): PlacedPiece[] {
  const capColN = capacity1D(effH, hN, spacingY)
  const capColR = capacity1D(effH, hR, spacingY)

  let x = marginX
  const pieces: PlacedPiece[] = []

  for (let i = 0; i < result.normalCount; i++) {
    let y = marginY
    for (let j = 0; j < capColN; j++) {
      pieces.push({ x, y, width: wN, height: hN, rotated: false })
      y += hN + spacingY
    }
    x += wN + spacingX
  }

  for (let i = 0; i < result.rotatedCount; i++) {
    let y = marginY
    for (let j = 0; j < capColR; j++) {
      pieces.push({ x, y, width: wR, height: hR, rotated: true })
      y += hR + spacingY
    }
    x += wR + spacingX
  }

  return pieces
}

/* ============================================================================
   PART 4 — Grid-based free-space decomposition with maximal merging
============================================================================ */

/**
 * Build sorted unique coordinate grid from sheet and pieces.
 */
function buildGrid(
  sheetWidth: number,
  sheetHeight: number,
  pieces: PlacedPiece[]
): { xs: number[]; ys: number[] } {
  const xsSet = new Set<number>([0, sheetWidth])
  const ysSet = new Set<number>([0, sheetHeight])

  for (const p of pieces) {
    xsSet.add(p.x)
    xsSet.add(p.x + p.width)
    ysSet.add(p.y)
    ysSet.add(p.y + p.height)
  }

  const xs = Array.from(xsSet).sort((a, b) => a - b)
  const ys = Array.from(ysSet).sort((a, b) => a - b)

  return { xs, ys }
}

/**
 * Compute an occupancy grid: free[j][i] indicates cell [xs[i], xs[i+1]] x [ys[j], ys[j+1]]
 * is free of any pieces.
 */
function computeFreeGrid(
  xs: number[],
  ys: number[],
  pieces: PlacedPiece[]
): boolean[][] {
  const nx = xs.length - 1
  const ny = ys.length - 1

  const free: boolean[][] = Array.from({ length: ny }, () =>
    Array<boolean>(nx).fill(true)
  )

  for (const p of pieces) {
    const px1 = p.x
    const px2 = p.x + p.width
    const py1 = p.y
    const py2 = p.y + p.height

    for (let j = 0; j < ny; j++) {
      const cy1 = ys[j]
      const cy2 = ys[j + 1]
      if (cy2 <= py1 || cy1 >= py2) continue // no vertical overlap

      for (let i = 0; i < nx; i++) {
        const cx1 = xs[i]
        const cx2 = xs[i + 1]
        if (cx2 <= px1 || cx1 >= px2) continue // no horizontal overlap

        free[j][i] = false
      }
    }
  }

  return free
}

/**
 * From a free-grid, build maximal vertical strips per x-interval,
 * then horizontally merge adjacent strips with same y/height.
 */
function computeWasteRectanglesFromGrid(
  sheetWidth: number,
  sheetHeight: number,
  pieces: PlacedPiece[]
): WasteRectangle[] {
  if (pieces.length === 0) {
    return [{ x: 0, y: 0, width: sheetWidth, height: sheetHeight }]
  }

  const { xs, ys } = buildGrid(sheetWidth, sheetHeight, pieces)
  const free = computeFreeGrid(xs, ys, pieces)
  const nx = xs.length - 1
  const ny = ys.length - 1

  const rects: WasteRectangle[] = []

  // Step 1: maximal vertical runs per column
  for (let i = 0; i < nx; i++) {
    let j = 0
    while (j < ny) {
      if (!free[j][i]) {
        j++
        continue
      }

      const startJ = j
      while (j < ny && free[j][i]) {
        j++
      }
      const endJ = j - 1

      rects.push({
        x: xs[i],
        y: ys[startJ],
        width: xs[i + 1] - xs[i],
        height: ys[endJ + 1] - ys[startJ]
      })
    }
  }

  // Step 2: horizontally merge adjacent strips with same y/height
  let merged = true
  while (merged) {
    merged = false

    outer: for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i]
        const b = rects[j]

        // Same vertical span and directly adjacent in X
        if (
          a.y === b.y &&
          a.height === b.height &&
          (a.x + a.width === b.x || b.x + b.width === a.x)
        ) {
          const x1 = Math.min(a.x, b.x)
          const x2 = Math.max(a.x + a.width, b.x + b.width)

          rects.splice(j, 1)
          rects.splice(i, 1, {
            x: x1,
            y: a.y,
            width: x2 - x1,
            height: a.height
          })

          merged = true
          break outer
        }
      }
    }
  }

  // Filter out zero-area rectangles (just in case)
  return rects.filter((r) => r.width > 0 && r.height > 0)
}

/* ============================================================================
   PART 5 — MAIN EXPORT
============================================================================ */

export function computeMaxPackedPiecesExtended(
  input: RectPackingInput
): RectPackingOutput {
  const {
    sheetWidth,
    sheetHeight,
    pieceWidth,
    pieceHeight,
    marginX = 0,
    marginY = 0,
    spacingX = 0,
    spacingY = 0
  } = input

  if (
    sheetWidth <= 0 ||
    sheetHeight <= 0 ||
    pieceWidth <= 0 ||
    pieceHeight <= 0
  ) {
    return {
      maxPieces: 0,
      usedArea: 0,
      usedAreaPercentage: 0,
      wastedArea: sheetWidth * sheetHeight,
      wastedAreaPercentage: 100,
      placedPieces: [],
      wastedRectangles: [{ x: 0, y: 0, width: sheetWidth, height: sheetHeight }]
    }
  }

  if (marginX < 0 || marginY < 0 || spacingX < 0 || spacingY < 0) {
    throw new Error('Margins and spacings must be >= 0')
  }

  const effW = sheetWidth - 2 * marginX
  const effH = sheetHeight - 2 * marginY

  if (effW <= 0 || effH <= 0) {
    return {
      maxPieces: 0,
      usedArea: 0,
      usedAreaPercentage: 0,
      wastedArea: sheetWidth * sheetHeight,
      wastedAreaPercentage: 100,
      placedPieces: [],
      wastedRectangles: [{ x: 0, y: 0, width: sheetWidth, height: sheetHeight }]
    }
  }

  const wN = pieceWidth
  const hN = pieceHeight
  const wR = pieceHeight
  const hR = pieceWidth

  const rowSolution = solveRowMixing(
    effW,
    effH,
    wN,
    hN,
    wR,
    hR,
    spacingX,
    spacingY
  )

  const colSolution = solveColumnMixing(
    effW,
    effH,
    wN,
    hN,
    wR,
    hR,
    spacingX,
    spacingY
  )

  const best =
    rowSolution.pieces >= colSolution.pieces
      ? { mode: 'row' as const, result: rowSolution }
      : { mode: 'col' as const, result: colSolution }

  const placedPieces =
    best.mode === 'row'
      ? buildRowLayout(
          effW,
          marginX,
          marginY,
          wN,
          hN,
          wR,
          hR,
          spacingX,
          spacingY,
          best.result
        )
      : buildColumnLayout(
          effH,
          marginX,
          marginY,
          wN,
          hN,
          wR,
          hR,
          spacingX,
          spacingY,
          best.result
        )

  const usedArea = placedPieces.reduce((sum, p) => sum + p.width * p.height, 0)
  const totalArea = sheetWidth * sheetHeight
  const wastedArea = totalArea - usedArea

  const wastedRectangles = computeWasteRectanglesFromGrid(
    sheetWidth,
    sheetHeight,
    placedPieces
  )

  return {
    maxPieces: best.result.pieces,
    usedArea,
    usedAreaPercentage: parseFloat(((usedArea / totalArea) * 100).toFixed(2)),
    wastedArea,
    wastedAreaPercentage: parseFloat(
      ((wastedArea / totalArea) * 100).toFixed(2)
    ),
    placedPieces,
    wastedRectangles
  }
}
