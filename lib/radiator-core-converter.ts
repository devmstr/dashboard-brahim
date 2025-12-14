// ---------------------------------------------
// Canonical domain schema
// ---------------------------------------------

export type FinsType = 'Normale' | 'Aérer' | 'Zigzag'

export interface InputData {
  width: number
  rows: number
  betweenCollectors: number
  pitch?: number
  fins: FinsType
}

// ---------------------------------------------
// Count calculations (already validated domain)
// ---------------------------------------------

export function calculateTubesCount(input: InputData): number {
  validateBaseInput(input)

  const { fins, width, rows, pitch } = input

  if (fins === 'Zigzag') {
    validatePitch(pitch)
    const tubesPerRow = (width - 10) / pitch + 1
    return Math.floor(tubesPerRow * rows)
  }

  const tubesPerRow = (width - 10) / 10
  return Math.floor(tubesPerRow * rows)
}

export function calculateFinsCount(input: InputData): number {
  validateBaseInput(input)

  const { fins, width, betweenCollectors, pitch } = input

  if (fins === 'Zigzag') {
    validatePitch(pitch)
    return Math.floor((width - 20) / pitch + 1)
  }

  const baseFins = (betweenCollectors - 20) / 3 + 1

  if (fins === 'Aérer') {
    return Math.floor(baseFins / 2)
  }

  return Math.floor(baseFins)
}

// ---------------------------------------------
// Weight conversion atoms
// ---------------------------------------------

/**
 * Converts tube count to weight
 *
 * Formula:
 * ((betweenCollectors + 15) * tubeCount) * multiplier
 */
export function convertTubeCountToWeight(params: {
  tubeCount: number
  betweenCollectors: number
  multiplier: number
}): number {
  const { tubeCount, betweenCollectors, multiplier } = params

  if (tubeCount <= 0) {
    throw new Error('tubeCount must be greater than 0')
  }

  if (betweenCollectors <= 0) {
    throw new Error('betweenCollectors must be greater than 0')
  }

  if (multiplier <= 0) {
    throw new Error('multiplier must be greater than 0')
  }

  return (betweenCollectors + 15) * tubeCount * multiplier
}

/**
 * Converts fins count to weight
 *
 * Formula:
 * finsCount * (width / (betweenCollectors - 20)) * multiplier
 */
export function convertFinsCountToWeight(params: {
  finsCount: number
  width: number
  betweenCollectors: number
  multiplier: number
}): number {
  const { finsCount, width, betweenCollectors, multiplier } = params

  if (finsCount <= 0) {
    throw new Error('finsCount must be greater than 0')
  }

  if (width <= 0) {
    throw new Error('width must be greater than 0')
  }

  if (betweenCollectors <= 20) {
    throw new Error('betweenCollectors must be greater than 20')
  }

  if (multiplier <= 0) {
    throw new Error('multiplier must be greater than 0')
  }

  return finsCount * (width / (betweenCollectors - 20)) * multiplier
}

// ---------------------------------------------
// Internal validation helpers
// ---------------------------------------------

function validateBaseInput({
  width,
  rows,
  betweenCollectors
}: InputData): void {
  if (width <= 0) {
    throw new Error('Width must be greater than 0')
  }

  if (rows <= 0) {
    throw new Error('Rows must be greater than 0')
  }

  if (betweenCollectors <= 0) {
    throw new Error('BetweenCollectors must be greater than 0')
  }
}

function validatePitch(pitch?: number): asserts pitch is number {
  if (!pitch || pitch <= 0) {
    throw new Error('Pitch is required and must be > 0 for Zigzag fins')
  }
}
