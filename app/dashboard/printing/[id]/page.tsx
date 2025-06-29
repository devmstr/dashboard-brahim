import { InvoicePrinterWrapper } from '@/app/dashboard/printing/[id]/invoice-client-wrapper'
import Invoice, { InvoiceMetadata } from './invoice'
import prisma from '@/lib/db'

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
        include: {
          Price: true
        }
      }
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
    <InvoicePrinterWrapper metadata={{ fileName: invoice.number }}>
      <Invoice
        id={invoice.id}
        items={(invoice.metadata as InvoiceMetadata)?.items}
        invoiceNumber={invoice.number}
        paymentMode={
          (invoice.metadata as InvoiceMetadata)?.paymentType ||
          invoice.paymentMode ||
          'Espèces'
        }
        type={invoice.type || 'FINAL'}
        dueDate={invoice.dueDate || new Date()}
        note={invoice.note || ''}
        status={invoice.status || 'PAID'}
        qrAddress={invoice.id}
        client={{
          name: invoice.clientName || '',
          address: invoice.clientAddress || '',
          rc: invoice.clientRC || '',
          nif: invoice.clientNif || '',
          ai: invoice.clientAi || ''
        }}
        metadata={invoice.metadata as InvoiceMetadata}
      />
    </InvoicePrinterWrapper>
  )
}
