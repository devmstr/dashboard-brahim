import { InvoicePrinterWrapper } from '@/app/dashboard/printing/[id]/invoice-client-wrapper'
import Invoice from './proforma-invoice'
import prisma from '@/lib/db'

export default async function Page() {
  return (
    <InvoicePrinterWrapper metadata={{ fileName: `Proforma-${Date.now()}` }}>
      <Invoice />
    </InvoicePrinterWrapper>
  )
}
