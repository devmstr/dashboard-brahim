import { BillingConfig, InvoiceItem } from '@/types'

export function calculateBillingSummary(
  items: InvoiceItem[],
  config: BillingConfig = {}
) {
  // Sum up all item amounts to get totalHT.
  const Total = items.reduce((acc, item) => acc + (item.price ?? 0), 0)

  // Use provided rates or defaults.
  const discountRate = config.discountRate ?? 0 // default 3%
  const refundRate = config.refundRate ?? 0 // default 0 if not provided
  const vatRate = config.vatRate ?? 0.19 // always 19%
  const stampTaxRate = config.stampTaxRate ?? 0 // always 1%
  // Calculate each component.
  const discount = Total * discountRate
  // Total HT equal Total.H.T A/DED minus remise and rg
  const totalAfterDiscount = Total - discount
  const refund = totalAfterDiscount * refundRate
  const totalHT = totalAfterDiscount - refund
  // TVA
  const vat = totalHT * vatRate
  // Timbre is 1% of totalHT
  const stampTax = (totalHT + vat) * stampTaxRate
  // Total TTC is the net amount plus TVA and timbre.
  const totalTTC = totalHT + vat + stampTax

  return {
    Total,
    totalHT,
    discount,
    refund,
    vat,
    stampTax,
    totalTTC
  }
}
