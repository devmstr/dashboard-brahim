import Invoice from './invoice'
import prisma from '@/lib/db'
import { InvoicePrinterWrapper } from './invoice-client-wrapper'
import ProformaInvoice from '../../printing/proforma-invoice'

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
      items: {
        orderBy: { id: 'asc' }
      }
    }
  })
  // console.log(invoice)
  if (!invoice) {
    return (
      <div className="text-red-500">
        Erreur lors du chargement de la facture.
      </div>
    )
  }
  return (
    <InvoicePrinterWrapper data={{ reference: invoice.reference }}>
      {invoice.type === 'FINAL' ? (
        <Invoice data={invoice} />
      ) : (
        <ProformaInvoice data={invoice} />
      )}
    </InvoicePrinterWrapper>
  )
}
