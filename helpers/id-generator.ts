import ShortUniqueId from 'short-unique-id'

export enum SKU_PREFIX {
  EM = 'EM', // employee
  RA = 'RA', // radiator
  FM = 'FM', // Véhicule
  RE = 'RE', // Radiateur renovation (typeof radiator)
  FA = 'FA', // Faisceau
  FE = 'FE', // Faisceau Empalé
  SP = 'SP', // Spirale
  MO = 'MO', // model
  VE = 'VE', // model type (vehicle)
  MR = 'MR', // brand
  AR = 'AR', // order item (article)
  AU = 'AU', // Other (typeof order item)
  CO = 'CO', // order
  CB = 'CB', // non confirmed order
  CL = 'CL', // client
  PA = 'PA', // payment
  FP = 'FP', // facture proforma
  FF = 'FF', // facture final
  FL = 'FL', // file
  PR = 'PR', // procurement requisition
  PI = 'PI', // procurement item
  PO = 'PO', // purchase order
  RC = 'RC', // receipt
  SI = 'SI', // supplier invoice
  SU = 'SU', // supplier
  RF = 'RF', // rfq
  CT = 'CT', // contract
  AS = 'AS' // asset
}

export type PREFIX = keyof typeof SKU_PREFIX

const uid = new ShortUniqueId({
  length: 6,
  shuffle: true,
  dictionary: 'ABCDEFGHJKLMNPQRSTUVWYZ123456789'.split('')
})

export function generateId(prefix: PREFIX): string {
  return `${SKU_PREFIX[prefix]}X${uid.rnd()}` // fixed 6 chars
}
