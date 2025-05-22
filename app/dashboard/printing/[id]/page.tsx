import Invoice from './invoice'
import prisma from '@/lib/db'

type Metadata = {
  items: {
    id: string
    name: string
    price: number
    quantity: number
  }[]
}

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
  // Prepare items for Invoice component
  let items: any[] = []
  if (invoice.items) {
    items = invoice.items.map((item) => {
      const quantity =
        (invoice.metadata as Metadata)?.items.find((i: any) => i.id === item.id)
          ?.quantity || 0
      return {
        id: item.id,
        designation: item.label || item.reference || '',
        quantity,
        priceHT: item.Price?.unit || 0,
        amount: Number(item.Price?.unit) * quantity
      }
    })
  }
  return (
    <div className="flex w-fit  justify-center items-start  min-h-screen  justify mx-auto">
      <Invoice
        items={items}
        invoiceId={invoice.number}
        paymentMode="Versement (Banque)"
        qrAddress={invoice.id}
        client={{
          name: invoice.Client?.name || invoice.customerName || '',
          address: invoice.Client?.Address?.street || '',
          rc: invoice.Client?.tradeRegisterNumber || '',
          nif: invoice.Client?.fiscalNumber || '',
          ai: invoice.Client?.statisticalIdNumber || ''
        }}
      />
    </div>
  )
}
