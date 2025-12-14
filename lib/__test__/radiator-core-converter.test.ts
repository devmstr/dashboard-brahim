import { describe, it, expect } from 'vitest'
import {
  calculateTubesCount,
  calculateFinsCount,
  convertTubeCountToWeight,
  convertFinsCountToWeight,
  type CoreInput
} from '../radiator-core-converter'

describe('radiator core atomic calculations', () => {
  const baseInput: CoreInput = {
    fins: 'Zigzag',
    width: 650,
    rows: 2,
    betweenCollectors: 500,
    pitch: 8
  }

  it('calculates tube count correctly', () => {
    expect(calculateTubesCount(baseInput)).toBe(162)
  })

  it('calculates fins count correctly', () => {
    expect(calculateFinsCount(baseInput)).toBe(79)
  })

  it('converts tube count to weight', () => {
    const tubeCount = 162
    const weight = convertTubeCountToWeight({
      tubeCount,
      betweenCollectors: 500,
      multiplier: 0.002
    })

    // (500 + 15) * 162 * 0.002 = 166.86
    expect(weight).toBeCloseTo(166.86)
  })

  it('converts fins count to weight', () => {
    const finsCount = 79
    const weight = convertFinsCountToWeight({
      finsCount,
      width: 650,
      betweenCollectors: 500,
      multiplier: 0.0015
    })

    // 79 * (650 / 480) * 0.0015 ≈ 0.160
    expect(weight).toBeCloseTo(0.16, 3)
  })

  it('throws on invalid multiplier', () => {
    expect(() =>
      convertTubeCountToWeight({
        tubeCount: 10,
        betweenCollectors: 500,
        multiplier: 0
      })
    ).toThrow()
  })
})
