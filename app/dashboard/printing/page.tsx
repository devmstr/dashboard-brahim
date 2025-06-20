import { InvoicePrinterWrapper } from './invoice-client-wrapper'
import ProformaInvoice from './proforma-invoice'
import prisma from '@/lib/db'

export default async function Page() {
  return (
    <InvoicePrinterWrapper metadata={{ fileName: `Proforma-${Date.now()}` }}>
      <ProformaInvoice />
    </InvoicePrinterWrapper>
  )
}
