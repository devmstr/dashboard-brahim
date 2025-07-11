import { z } from 'zod'

export const invoiceSchema = z.object({
  id: z.string(),
  reference: z.string(),
  date: z.date().nullable().optional(),
  name: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  tradeRegisterNumber: z.string().nullable().optional(),
  registrationArticle: z.string().nullable().optional(),
  taxIdNumber: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  paymentMode: z.string().nullable().optional(),
  purchaseOrder: z.string().nullable().optional(),
  deliverySlip: z.string().nullable().optional(),
  discountRate: z.number().min(0).max(100).nullable().optional(),
  refundRate: z.number().min(0).max(100).nullable().optional(),
  stampTaxRate: z.number().min(0).max(100).nullable().optional(),
  offerValidity: z.string().nullable().optional(),
  guaranteeTime: z.string().nullable().optional(),
  deliveryTime: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  total: z.number().nullable().optional(),
  subtotal: z.number().nullable().optional(),
  tax: z.number().nullable().optional(),
  items: z.array(z.any()).nullable().optional(), // Replace z.any() with a proper item schema if needed
  orderId: z.string().nullable().optional(),
  clientId: z.string().nullable().optional(),
  deletedAt: z.date().nullable().optional(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
  histories: z.array(z.any()).nullable().optional()
})
export type InvoiceSchemaType = z.infer<typeof invoiceSchema>
