import { customAlphabet } from 'nanoid'

export enum SKU_PREFIX {
  EM = 'EM', // employee
  RA = 'RA', // radiator
  VE = 'VE', // Véhicule
  RE = 'RE', // Radiateur renovation (typeof radiator)
  FA = 'FA', // Faisceau
  FE = 'FE', // Faisceau Empalé
  SP = 'SP', // Spirale
  MO = 'MO', // model
  BR = 'BR', // brand
  AR = 'AR', // order item (article)
  AU = 'AU', // Other (typeof order item)
  CO = 'CO', // order
  CB = 'CB', // non confirmed order
  CL = 'CL', // client
  PA = 'PA', // payment
  FP = 'FP', // facture proforma
  FF = 'FF', // facture final
  FL = 'FL' // file
}

export type PREFIX = keyof typeof SKU_PREFIX

export function generateId(prefix: PREFIX): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWYZ123456789'
  const generateId = customAlphabet(alphabet, 6)
  const uniqueId = generateId()
  return `${prefix}X${uniqueId}`
}
