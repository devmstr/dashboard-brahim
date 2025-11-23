import { Card, CardGrid } from '@/components/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StatusBudge } from '@/components/status-badge'
import { getProcurementById } from '@/lib/mock/procurements'
import { notFound } from 'next/navigation'
import { ProcurementDetailForm } from './_components/procurement-detail.form'
import { ProcurementInvoiceUpload } from './_components/procurement-invoice-upload'
import { format } from 'date-fns'

interface PageProps {
  params: {
    procurementId: string
  }
}

const Page: React.FC<PageProps> = async ({ params: { procurementId } }) => {
  const procurement = await getProcurementById(procurementId)

  if (!procurement) return notFound()

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Fiche d'achat</p>
            <h2 className="text-xl font-semibold">{procurement.reference}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBudge variant={procurement.status} />
            <Badge variant="secondary">{procurement.vendor}</Badge>
            <Badge variant="outline">{procurement.contactName}</Badge>
          </div>
        </div>
        <Separator />
        <CardGrid className="grid-cols-1 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Créée le</p>
            <p className="font-semibold">
              {format(new Date(procurement.createdAt), 'dd MMM yyyy')}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Échéance</p>
            <p className="font-semibold">
              {format(new Date(procurement.expectedDate), 'dd MMM yyyy')}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="font-semibold">
              {new Intl.NumberFormat('fr-DZ', {
                style: 'currency',
                currency: procurement.currency || 'DZD',
                maximumFractionDigits: 0
              }).format(procurement.total)}
            </p>
          </div>
        </CardGrid>
      </Card>

      <Card className="space-y-6">
        <ProcurementDetailForm procurement={procurement} />
      </Card>

      <Card>
        <ProcurementInvoiceUpload procurement={procurement} />
      </Card>
    </div>
  )
}

export default Page
