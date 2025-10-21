import prisma from './db'

export async function generateInvoiceReference(
  type: 'FINAL' | 'PROFORMA' | string | null | undefined
): Promise<string> {
  const currentYear = new Date().getFullYear()
  const yearSuffix = String(currentYear).slice(-2) // "25" for 2025
  const prefix = type === 'FINAL' ? 'FF' : 'FP'

  // Get the most recent invoice of this type for the current year
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      type,
      reference: {
        startsWith: `${prefix}${yearSuffix}-`
      }
    },
    orderBy: { createdAt: 'desc' },
    select: { reference: true }
  })

  let nextNumber = 1

  if (lastInvoice?.reference) {
    // Extract numeric part safely, e.g. "FF25-012" → 12
    const match = lastInvoice.reference.match(/-(\d+)$/)
    if (match) nextNumber = parseInt(match[1], 10) + 1
  }

  // Pad with leading zeros (e.g. 001, 002, ...)
  const formattedNumber = String(nextNumber).padStart(3, '0')
  return `${prefix}${yearSuffix}-${formattedNumber}`
}
