import { Card } from '@/components/card'
import { LedgerTable } from './ledger.table'
import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { UserRole } from '@/types'
import FinanceMetadataCard, {
  FinanceStats
} from '@/components/finance-stats.card'

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

  // stats calculation
  // Determine current and previous month ranges
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonth = prev.getMonth()
  const prevYear = prev.getFullYear()

  const sums = invoices.reduce(
    (acc, inv) => {
      const created = inv.createdAt ? new Date(inv.createdAt) : null
      if (!created) return acc

      const isCurrent =
        created.getMonth() === currentMonth &&
        created.getFullYear() === currentYear
      const isPrev =
        created.getMonth() === prevMonth && created.getFullYear() === prevYear

      const subtotal = Number(inv.subtotal),
        discount = Number(inv.discount),
        refund = Number(inv.refund),
        vat = Number(inv.vat),
        total = Number(inv.total)

      if (isCurrent) {
        acc.current.bruteHT += subtotal + discount + refund
        acc.current.ttc += total
        acc.current.tva += vat
        // net commercial: subtotal minus discount/refund
        acc.current.netCommercial += subtotal
      }

      if (isPrev) {
        acc.prev.bruteHT += subtotal + discount + refund
        acc.prev.ttc += total
        acc.prev.tva += vat
        // net commercial: subtotal minus discount/refund
        acc.prev.netCommercial += subtotal
      }

      return acc
    },
    {
      current: { bruteHT: 0, netCommercial: 0, tva: 0, ttc: 0 },
      prev: { bruteHT: 0, netCommercial: 0, tva: 0, ttc: 0 }
    }
  )

  const computeDelta = (nowVal: number, prevVal: number) => {
    if (prevVal === 0) return 0
    const delta = ((nowVal - prevVal) / Math.abs(prevVal)) * 100
    return (delta * 10) / 10 // one deciml
  }

  const stats: FinanceStats = {
    bruteHT: {
      title: 'TOTAL Brute HT',
      value: sums.current.bruteHT,
      delta: computeDelta(sums.current.bruteHT, sums.prev.bruteHT),
      lastMonth: sums.prev.bruteHT,
      positive: computeDelta(sums.current.bruteHT, sums.prev.bruteHT) >= 0
    },
    netCommercial: {
      title: 'Net commercial',
      value: sums.current.netCommercial,
      delta: computeDelta(sums.current.netCommercial, sums.prev.netCommercial),
      lastMonth: sums.prev.netCommercial,
      positive:
        computeDelta(sums.current.netCommercial, sums.prev.netCommercial) >= 0
    },
    tva19: {
      title: 'TVA 19%',
      value: sums.current.tva,
      delta: computeDelta(sums.current.tva, sums.prev.tva),
      lastMonth: sums.prev.tva,
      positive: computeDelta(sums.current.tva, sums.prev.tva) >= 0
    },
    ttc: {
      title: 'TTC',
      value: sums.current.ttc,
      delta: computeDelta(sums.current.ttc, sums.prev.ttc),
      lastMonth: sums.prev.ttc,
      positive: computeDelta(sums.current.ttc, sums.prev.ttc) >= 0
    }
  }

  return (
    <div className="space-y-6">
      {['FINANCE_MANAGER', 'SALES_MANAGER'].includes(
        user?.role as UserRole
      ) && <FinanceMetadataCard stats={stats} />}
      <Card>
        <LedgerTable userRole={user?.role} data={formattedData} />
      </Card>
    </div>
  )
}

export default Page
