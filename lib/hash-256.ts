/* eslint-disable @typescript-eslint/no-unused-vars */
import SHA256 from 'crypto-js/sha256'
import { ProductConfig } from './utils'
import { createHash } from 'crypto'

export type HashConfig = {
  lowerCollectorLength: any
  lowerCollectorWidth: any
  upperCollectorLength: any
  upperCollectorWidth: any
  betweenCollectors: any
  pitch: any
  width: any
  tubeDiameter: any
  cooling: any
  rows: any
  fins: any
  position: any
  tightening: any
  tubeType: any
  type: any
  fabrication: any
  dirId: any
}

export function generateHash({
  lowerCollectorLength,
  lowerCollectorWidth,
  upperCollectorLength,
  upperCollectorWidth,
  betweenCollectors,
  width,
  tubeDiameter,
  cooling,
  fins,
  pitch,
  position,
  rows,
  tightening,
  tubeType,
  type,
  fabrication,
  dirId
}: HashConfig): string {
  const stableString = JSON.stringify(
    Object.keys({
      lowerCollectorLength,
      lowerCollectorWidth,
      upperCollectorLength,
      upperCollectorWidth,
      betweenCollectors,
      width,
      tubeDiameter,
      cooling,
      fins,
      pitch,
      position,
      rows,
      tightening,
      tubeType,
      type,
      fabrication,
      dirId
    })
      .sort()
      .reduce((acc, key) => {
        acc[key] = (
          {
            lowerCollectorLength,
            lowerCollectorWidth,
            upperCollectorLength,
            upperCollectorWidth,
            betweenCollectors,
            width,
            tubeDiameter,
            cooling,
            fins,
            pitch,
            position,
            rows,
            tightening,
            tubeType,
            type,
            fabrication,
            dirId
          } as any
        )[key]
        return acc
      }, {} as any)
  )
  return createHash('sha256').update(stableString).digest('hex')
}
