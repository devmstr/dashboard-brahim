/* eslint-disable @typescript-eslint/no-unused-vars */
import SHA256 from 'crypto-js/sha256'

export interface HashDataType {
  fins: string | null
  coreHeight: string | null
  coreWidth: string | null
  collectorHeight: string | null
  collectorWidth: string | null
  rows: string | null
  finsPitch: string | null
  tube: string | null
  collectorPosition: string | null
  collectorTightening: string | null
}

export function hash256(data: HashDataType): string {
  // Remove null values and sort the object keys
  const cleanedData = Object.fromEntries(
    Object.entries(data)
      .filter(
        ([_, value]) =>
          value !== null && value !== '' && value !== 'NaN' && value !== '0'
      ) // Check for both null and empty string
      .sort(([a], [b]) => a.localeCompare(b)) // Sort keys alphabetically
  )

  const dataString = Object.values(cleanedData).join(',')
  const hash = SHA256(dataString).toString()
  return hash
}
