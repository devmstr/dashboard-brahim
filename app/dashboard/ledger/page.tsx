import { Card } from '@/components/card'
import { LedgerTable } from './ledger.table'
import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { UserRole } from '@/types'
import FinanceMetadataCard from '@/components/finance-stats.card'

const Page = async () => {
  const user = await getCurrentUser()
  // Fetch all invoices with client and address info
  const invoices = await prisma.invoice.findMany({
    where: { deletedAt: null },
    include: {
      items: true,
      Client: true
    },
    orderBy: { createdAt: 'desc' }
  })

  const formattedData = invoices.map((invoice) => ({
    billId: invoice.reference,
    id: invoice.id,
    total: invoice.total || 0,
    type: invoice.type as 'FINAL' | 'PROFORMA',
    items: invoice.items.length + 1,
    createdAt: invoice.createdAt?.toISOString() ?? '',
    company: invoice.name || '',
    phone: invoice.Client?.phone || '',
    location: invoice.address || ''
  }))

  return (
    <div className="space-y-6">
      {['FINANCE_MANAGER', 'SALES_MANAGER'].includes(
        user?.role as UserRole
      ) && <FinanceMetadataCard />}
      <Card>
        <LedgerTable userRole={user?.role} data={formattedData} />
      </Card>
    </div>
  )
}

export default Page
