// test/maxRectsPacking.test.ts
import { describe, it, expect } from 'vitest'
import { computeMaxPackedPiecesExtended } from './max-rec-packing'
import type { RectPackingInput, RectPackingOutput } from './types'

function run(input: RectPackingInput): RectPackingOutput {
  return computeMaxPackedPiecesExtended(input)
}

describe('computeMaxPiecesWithMaxRects', () => {
  it('mixed-orientation advantage (2000x1000, 700x150)', () => {
    // Expected optimal layout in practice: 17 pieces
    // (2 rows of 2 + 1 rotated row with 13)
    const { maxPieces } = run({
      sheetWidth: 2000,
      sheetHeight: 1000,
      pieceWidth: 700,
      pieceHeight: 150
    })

    expect(maxPieces).toBeGreaterThanOrEqual(13)
    // If maxrects-packer is strong enough, this should be 17:
    expect(maxPieces).toBe(17)
  })
  it('mixed-orientation advantage (2000x1000, 200x865)', () => {
    const result = run({
      sheetWidth: 2000,
      sheetHeight: 1000,
      pieceWidth: 865,
      pieceHeight: 200
    })

    const {
      maxPieces,
      wastedArea,
      usedArea,
      placedPieces,
      wastedRectangles,
      usedAreaPercentage,
      wastedAreaPercentage
    } = result

    expect(maxPieces).toBeGreaterThanOrEqual(10)
    // If maxrects-packer is strong enough, this should be 11:
    expect(maxPieces).toBe(11)

    // console.log(JSON.stringify(result, null, 2))
  })
})
