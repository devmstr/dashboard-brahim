import * as z from 'zod'

const lineItemBaseSchema = z.object({
  itemId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  quantity: z.number().optional().nullable(),
  unit: z.string().optional().nullable()
})

const costedLineItemSchema = lineItemBaseSchema.extend({
  estimatedUnitCost: z.number().optional().nullable(),
  currency: z.string().optional().nullable()
})

const namedCostedLineItemSchema = costedLineItemSchema.extend({
  itemName: z.string().optional().nullable()
})

export const requisitionItemInputSchema = namedCostedLineItemSchema

export const requisitionInputSchema = z.object({
  reference: z.string().min(1),
  title: z.string().optional().nullable(),
  serviceId: z.string().min(1),
  neededBy: z.date().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(requisitionItemInputSchema).optional()
})

export const rfqLineInputSchema = costedLineItemSchema

export const rfqInputSchema = z.object({
  reference: z.string().min(1),
  requisitionId: z.string().optional().nullable(),
  serviceId: z.string().min(1),
  neededBy: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable(),
  lines: z.array(rfqLineInputSchema).optional()
})

export const purchaseOrderItemInputSchema = lineItemBaseSchema.extend({
  unitPrice: z.number().optional().nullable(),
  total: z.number().optional().nullable()
})

export const purchaseOrderInputSchema = z.object({
  reference: z.string().min(1),
  supplierId: z.string().optional().nullable(),
  requisitionId: z.string().optional().nullable(),
  rfqId: z.string().optional().nullable(),
  serviceId: z.string().min(1),
  vendor: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  currency: z.string().optional().nullable(),
  expectedDate: z.coerce.date().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  itemsCount: z.number().optional().nullable(),
  items: z.array(purchaseOrderItemInputSchema).optional()
})

export const receiptItemInputSchema = z.object({
  purchaseOrderItemId: z.string().optional().nullable(),
  itemId: z.string().optional().nullable(),
  quantityReceived: z.number().optional().nullable(),
  condition: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
})

export const receiptInputSchema = z.object({
  reference: z.string().min(1),
  purchaseOrderId: z.string().min(1),
  serviceId: z.string().min(1),
  receivedAt: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(receiptItemInputSchema).optional()
})

export const supplierInvoiceInputSchema = z.object({
  reference: z.string().min(1),
  supplierId: z.string().min(1),
  purchaseOrderId: z.string().optional().nullable(),
  receiptId: z.string().optional().nullable(),
  serviceId: z.string().min(1),
  invoiceDate: z.coerce.date().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  paidAt: z.coerce.date().optional().nullable(),
  currency: z.string().optional().nullable(),
  subtotal: z.number().optional().nullable(),
  taxes: z.number().optional().nullable(),
  total: z.number().optional().nullable(),
  notes: z.string().optional().nullable()
})

export const supplierInputSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  fiscalNumber: z.string().optional().nullable(),
  taxIdNumber: z.string().optional().nullable(),
  registrationArticle: z.string().optional().nullable(),
  statisticalIdNumber: z.string().optional().nullable(),
  tradeRegisterNumber: z.string().optional().nullable(),
  approvalNumber: z.string().optional().nullable(),
  addressId: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  cityId: z.string().optional().nullable(),
  provinceId: z.string().optional().nullable(),
  countryId: z.string().optional().nullable(),
  zip: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
})

export const contractInputSchema = z.object({
  reference: z.string().min(1),
  title: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  serviceId: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  value: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
})

export const assetItemInputSchema = namedCostedLineItemSchema

export const assetInputSchema = z.object({
  reference: z.string().min(1),
  name: z.string().min(1),
  supplierId: z.string().optional().nullable(),
  purchaseOrderId: z.string().optional().nullable(),
  serviceId: z.string().min(1),
  acquisitionDate: z.coerce.date().optional().nullable(),
  value: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(assetItemInputSchema).optional()
})

export const procurementItemInputSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  isActive: z.boolean().optional().nullable()
})
