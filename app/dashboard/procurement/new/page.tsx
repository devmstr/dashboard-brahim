import { Card, CardGrid } from '@/components/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PROCUREMENT_STATUS_TYPES, STATUS_TYPES } from '@/config/global'
import type { ProcurementRecord } from '@/types/procurement'
import { format } from 'date-fns'
import { ProcurementDetailForm } from '../[procurementId]/_components/procurement-detail.form'

const Page: React.FC = () => {
  const today = new Date()
  const draftProcurement: ProcurementRecord = {
    id: 'NEW-PROCUREMENT',
    reference: '',
    vendor: '',
    contactName: '',
    contactEmail: '',
    phone: '',
    status: PROCUREMENT_STATUS_TYPES[1],
    items: 1,
    total: 0,
    currency: 'DZD',
    createdAt: today.toISOString(),
    expectedDate: today.toISOString(),
    paymentTerms: '',
    notes: '',
    attachments: []
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Nouvelle fiche d'achat
            </p>
            <h2 className="text-xl font-semibold">Créer une demande</h2>
          </div>
          <Badge variant="secondary">Brouillon</Badge>
        </div>
        <Separator />
        <CardGrid className="grid-cols-1 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Création</p>
            <p className="font-semibold">{format(today, 'dd MMM yyyy')}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Échéance proposée</p>
            <p className="font-semibold">{format(today, 'dd MMM yyyy')}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Statut initial</p>
            <p className="font-semibold">Planifiée</p>
          </div>
        </CardGrid>
      </Card>

      <Card className="space-y-6">
        <ProcurementDetailForm procurement={draftProcurement} />
      </Card>
    </div>
  )
}

export default Page
