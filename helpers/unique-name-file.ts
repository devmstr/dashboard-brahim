import { generateId } from './id-generator'

export function generateUniqueFilename(originalFilename: string): string {
  const extension =
    originalFilename.split('.').pop()?.toLowerCase() || 'unknown'
  const uniqueId = generateId('FL')
  return `${uniqueId}.${extension}`
}
