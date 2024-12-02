'use server'
import { customAlphabet } from 'nanoid'

export enum SKU_PREFIX {
  RA = 'RA',
  FA = 'FA',
  CL = 'CL',
  VE = 'VE',
  AU = 'AU'
}

export async function newSkuId(prefix: SKU_PREFIX): Promise<string> {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const generateId = customAlphabet(alphabet, 6)
  const uniqueId = generateId()
  return `${prefix}X${uniqueId}`
}
