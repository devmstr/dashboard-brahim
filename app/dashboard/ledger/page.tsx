import prisma from '@/lib/db'
import InvoiceLedgerTabs from './invoice-ledger-tabs'

const Page = async () => {
  // Fetch all invoices with client and address info
  const invoices = await prisma.invoice.findMany({
    where: { deletedAt: null },
    include: {
      Client: {
        include: {
          Address: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Map invoices to the format expected by LedgerTable
  const allInvoicesData = invoices.map((inv) => {
    let itemsCount = 0
    let meta = inv.metadata
    if (typeof meta === 'string') {
      try {
        meta = JSON.parse(meta)
      } catch {}
    }
    if (
      meta &&
      typeof meta === 'object' &&
      !Array.isArray(meta) &&
      'items' in meta
    ) {
      const itemsArr = (meta as any).items
      if (Array.isArray(itemsArr)) itemsCount = itemsArr.length
    }
    return {
      billId: inv.number,
      id: inv.id,
      total: inv.total || 0,
      items: itemsCount,
      status: inv.status || '',
      dueDate: inv.dueDate ? inv.dueDate.toISOString() : '',
      type: inv.type || '',
      paymentMode: inv.paymentMode || '',
      createdAt: inv.createdAt.toISOString(),
      company: inv.Client?.name || inv.clientName || '',
      phone: inv.Client?.phone || '',
      location: inv.Client?.Address?.street || inv.clientAddress || ''
    }
  })

  // Separate draft and normal invoices based on your business logic
  // You might have a status field or another way to distinguish them
  const draftInvoices = allInvoicesData.filter(
    (invoice) => invoice.type === 'PROFORMA' // Replace with your actual condition for draft invoices
  )

  const normalInvoices = allInvoicesData.filter(
    (invoice) => invoice.type === 'FINAL' // Replace with your actual condition for normal invoices
  )

  return (
    <div className="container mx-auto py-6">
      <InvoiceLedgerTabs
        draftInvoices={draftInvoices}
        normalInvoices={normalInvoices}
        userRole="ACCOUNTANT"
      />
    </div>
  )
}

export default Page
