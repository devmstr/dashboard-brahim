/* eslint-disable @typescript-eslint/no-unused-vars */
import { ProductConfig } from '@/helpers/radiator-label'
import SHA256 from 'crypto-js/sha256'

export function hash256(data: ProductConfig): string {
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
