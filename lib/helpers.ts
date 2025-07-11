import prisma from './db'

export async function generateInvoiceReference(
  type: 'FINAL' | 'PROFORMA' | string | null | undefined
) {
  const currentYear = new Date().getFullYear()
  const yearSuffix = String(currentYear).slice(-2) // e.g., "25" from "2025"
  const prefix = type === 'FINAL' ? 'FF' : 'FP'

  // Start of current year
  const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`)

  // Count how many invoices of this type were created since start of year
  const count = await prisma.invoice.count({
    where: {
      type,
      createdAt: {
        gte: startOfYear
      }
    }
  })

  // Next invoice number (pad to 3 digits)
  const nextNumber = String(count + 1).padStart(3, '0')

  // Final reference like: 25-001, 25-002...
  return `${prefix}${yearSuffix}-${nextNumber}`
}
