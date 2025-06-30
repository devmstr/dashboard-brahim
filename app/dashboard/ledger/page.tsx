import { Card } from '@/components/card'
import { LedgerTable } from './ledger.table'
import prisma from '@/lib/db'

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
  const data = invoices.map((inv) => {
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
      type: inv.type as 'FINAL' | 'PROFORMA',
      items: itemsCount,
      createdAt: inv.createdAt.toISOString(),
      company: inv.Client?.name || inv.clientName || '',
      phone: inv.Client?.phone || '',
      location: inv.Client?.Address?.street || ''
    }
  })

  return (
    <Card>
      <LedgerTable userRole="ACCOUNTANT" data={data} />
    </Card>
  )
}

export default Page
