import { InvoicePrinterWrapper } from '@/app/dashboard/printing/[id]/invoice-client-wrapper'
import Invoice, { InvoiceMetadata } from './invoice'
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
      {invoice.type === 'FINAL' ? (
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
          purchaseOrder={invoice.purchaseOrder || ''}
          deliverySlip={invoice.deliverySlip || ''}
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
      ) : (
        <ProformaInvoice
          data={{
            billingSummary: {
              totalHT: invoice.subtotal || 0,
              vat: invoice.tax || 0,
              totalTTC: invoice.total || 0,
              discount: invoice.discountRate || 0,
              refund: invoice.refundRate || 0,
              stampTax: invoice.stampTaxRate || 0
            },
            client: {
              name: invoice.clientName || '',
              address: invoice.clientAddress || '',
              rc: invoice.clientRC || '',
              nif: invoice.clientNif || '',
              ai: invoice.clientAi || ''
            },
            items: (invoice.metadata as InvoiceMetadata)?.items || [],
            note: invoice.note || '',
            type: invoice.type || 'PROFORMA',
            paymentMode:
              (invoice.metadata as InvoiceMetadata)?.paymentType ||
              invoice.paymentMode ||
              'Espèces',
            dueDate: invoice.dueDate?.toISOString(),
            id: invoice.id,
            invoiceNumber: invoice.number,
            qrAddress: invoice.id,
            metadata: invoice.metadata as InvoiceMetadata,
            discountRate: invoice.discountRate || 0,
            refundRate: invoice.refundRate || 0,
            stampTaxRate: invoice.stampTaxRate || 0,
            purchaseOrder: invoice.purchaseOrder || '',
            deliverySlip: invoice.deliverySlip || '',
            offerValidity: invoice.offerValidity?.toISOString() || '',
            deliveryTime: invoice.deliveryTime?.toString() || '',
            guaranteeTime: invoice.guaranteeTime?.toString() || ''
          }}
        />
      )}
    </InvoicePrinterWrapper>
  )
}
