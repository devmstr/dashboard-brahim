import { InvoicePrinterWrapper } from '@/app/dashboard/printing/[id]/invoice-client-wrapper'
import Invoice from './invoice'
import prisma from '@/lib/db'
import ProformaInvoice from '../proforma-invoice'

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params
  // Fetch invoice data directly from the database
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      Client: {
        include: {
          Address: true
        }
      },
      items: true
    }
  })
  if (!invoice) {
    return (
      <div className="text-red-500">
        Erreur lors du chargement de la facture.
      </div>
    )
  }
  return (
    <InvoicePrinterWrapper metadata={{ fileName: invoice.reference }}>
      {invoice.type === 'FINAL' ? (
        <Invoice data={invoice} />
      ) : (
        <ProformaInvoice data={invoice} />
      )}
    </InvoicePrinterWrapper>
  )
}
