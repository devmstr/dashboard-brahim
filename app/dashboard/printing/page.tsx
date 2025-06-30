import { ProformaInvoicePrinterWrapper } from './proforma-invoice-wrapper'
import ProformaInvoice from './proforma-invoice'

export default async function Page() {
  return (
    <ProformaInvoicePrinterWrapper
      metadata={{ fileName: `Proforma-${Date.now()}` }}
    >
      <ProformaInvoice />
    </ProformaInvoicePrinterWrapper>
  )
}
