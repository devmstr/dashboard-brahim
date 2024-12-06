'use server'
import { customAlphabet } from 'nanoid'

export enum SKU_PREFIX {
  RA = 'RA',
  FA = 'FA',
  CO = 'CO',
  CL = 'CL',
  VE = 'VE',
  AU = 'AU'
}

export type PREFIX = keyof typeof SKU_PREFIX

export async function newSkuId(prefix: PREFIX): Promise<string> {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const generateId = customAlphabet(alphabet, 6)
  const uniqueId = generateId()
  return `${prefix}X${uniqueId}`
}
