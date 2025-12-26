import { Card } from '@/components/card'
import { listSupplierInvoices } from '@/lib/procurement/actions'
import { getUserRole } from '@/lib/session'
import { SupplierInvoicesTable } from './_components/supplier-invoices-table'

const Page = async () => {
  const [invoices, userRole] = await Promise.all([
    listSupplierInvoices(),
    getUserRole()
  ])

  return (
    <Card>
      <SupplierInvoicesTable data={invoices} userRole={userRole ?? undefined} />
    </Card>
  )
}

export default Page
