// tests/nesting/multi-nesting.test.ts
import { describe, it, expect } from 'vitest'
import { computeMultiShapeSheetNesting } from '../multi-2d-nesting' // adjust path if needed
import { MultiNestingInput } from '../types'

describe('nestMultipleRectangles - 17 rectangles of 150x700', () => {
  const testItemsExplicit = [
    { productId: 'TEST', width: 150, height: 700, quantity: 1 },
    { productId: 'TEST', width: 150, height: 700, quantity: 1 },
    { productId: 'TEST', width: 150, height: 700, quantity: 1 },
    { productId: 'TEST', width: 150, height: 700, quantity: 1 },
    { productId: 'TEST', width: 150, height: 700, quantity: 1 },
    { productId: 'TEST', width: 150, height: 700, quantity: 1 },
    { productId: 'TEST', width: 150, height: 700, quantity: 1 },
    { productId: 'TEST', width: 150, height: 700, quantity: 1 },
    { productId: 'TEST', width: 150, height: 700, quantity: 1 },
    { productId: 'TEST', width: 150, height: 700, quantity: 1 },
    { productId: 'TEST', width: 150, height: 700, quantity: 1 },
    { productId: 'TEST', width: 150, height: 700, quantity: 1 },
    { productId: 'TEST', width: 150, height: 700, quantity: 1 },
    { productId: 'TEST', width: 150, height: 700, quantity: 1 },
    { productId: 'TEST', width: 150, height: 700, quantity: 1 },
    { productId: 'TEST', width: 150, height: 700, quantity: 1 },
    { productId: 'TEST', width: 150, height: 700, quantity: 1 }
  ]

  const input: MultiNestingInput = {
    sheetWidth: 2000,
    sheetHeight: 1000,
    padding: 0,
    allowRotation: true,
    items: testItemsExplicit
  }

  it('packs 17 rectangles into exactly 1 sheet', () => {
    const result = computeMultiShapeSheetNesting(input)

    expect(result.sheetCount).toBe(1)
    expect(result.totalRectangles).toBe(17)
    expect(result.sheets[0].rectangles.length).toBe(17)
  })

  it('uses mixed orientation for ultra-tight packing', () => {
    const result = computeMultiShapeSheetNesting(input)
    const sheet = result.sheets[0]

    const rotatedCount = sheet.rectangles.filter((r) => r.rotated).length

    // At least 1 rotated, but not all rotated = mixed orientation
    expect(rotatedCount).toBeGreaterThan(0)
    expect(rotatedCount).toBeLessThan(17)
  })

  it('achieves reasonable utilization for this layout', () => {
    const result = computeMultiShapeSheetNesting(input)

    expect(result.globalUtilization.toFixed(2)).toBe('0.89')
    expect(result.wastePercentage.toFixed(2)).toBe('10.75')
  })

  it('does not throw and all rectangles have valid coordinates', () => {
    const result = computeMultiShapeSheetNesting(input)
    const placed = result.sheets[0].rectangles

    for (const r of placed) {
      expect(r.x).toBeGreaterThanOrEqual(0)
      expect(r.y).toBeGreaterThanOrEqual(0)
      expect(r.width).toBeGreaterThan(0)
      expect(r.height).toBeGreaterThan(0)
      expect(r.sheetIndex).toBe(0)
    }
  })
})
