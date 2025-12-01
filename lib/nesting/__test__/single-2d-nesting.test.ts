// tests/nesting/single-nesting.test.ts
import { describe, it, expect } from 'vitest'
import { computeMaxFitForSingleShape } from '../single-2d-nesting' // ← adjust import if needed

describe('computeMaxFitForSingleShape - single rectangle type 150x700', () => {
  it('correctly fits 17 rectangles in a single 2000x1000 sheet', () => {
    const result = computeMaxFitForSingleShape({
      sheetWidth: 2000,
      sheetHeight: 1000,
      rectWidth: 150,
      rectHeight: 700,
      allowRotation: true,
      padding: 0
    })

    //
    // EXPECT MAX FIT = 17
    //
    expect(result.maxCount).toBe(17)
    expect(result.rectangles.length).toBe(17)

    //
    // USAGE METRICS
    //
    expect(result.usedArea).toBe(17 * 150 * 700)
    expect(result.totalArea).toBe(2000 * 1000)
    expect(result.wastePercentage).toBe(10.75)

    //
    // ORIENTATION EXPECTATION: MIXED (some rotated)
    //
    const rotatedCount = result.rectangles.filter((r) => r.rotated).length
    expect(rotatedCount).toBeGreaterThan(0)
    expect(rotatedCount).toBeLessThan(17)
    expect(result.orientation).toBe('mixed')

    //
    // ROTATION-AWARE GEOMETRY CHECKS
    //
    for (const r of result.rectangles) {
      const actualWidth = r.rotated ? r.height : r.width
      const actualHeight = r.rotated ? r.width : r.height

      // Must be placed within sheet boundaries
      expect(r.x).toBeGreaterThanOrEqual(0)
      expect(r.y).toBeGreaterThanOrEqual(0)

      expect(actualWidth).toBeGreaterThan(0)
      expect(actualHeight).toBeGreaterThan(0)

      expect(r.x + actualWidth).toBeLessThanOrEqual(2000)
      expect(r.y + actualHeight).toBeLessThanOrEqual(1000)
    }
  })
})
