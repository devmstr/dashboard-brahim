'use client'

import { CardGrid } from '@/components/card'
import { OrderUploader } from '@/components/order-uploader'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { addAttachmentToProcurement } from '@/lib/mock/procurements'
import type { ProcurementRecord } from '@/types/procurement'
import { format } from 'date-fns'

interface ProcurementInvoiceUploadProps {
  procurement: ProcurementRecord
}

export const ProcurementInvoiceUpload: React.FC<ProcurementInvoiceUploadProps> = ({
  procurement
}) => {
  const deliveryDate = procurement.deliveredAt
    ? format(new Date(procurement.deliveredAt), 'dd MMM yyyy HH:mm')
    : 'Non livré'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Facture et documents</p>
          <h3 className="text-lg font-semibold">Uploads fournisseur</h3>
        </div>
        <Badge variant="outline">Livraison : {deliveryDate}</Badge>
      </div>
      <Separator />
      <CardGrid className="grid-cols-1">
        <div className="space-y-2">
          <Label className="text-sm">Facture fournisseur</Label>
          <OrderUploader
            uploadPath={`procurement/${procurement.id}/invoice`}
            initialAttachments={procurement.attachments}
            maxFiles={5}
            acceptedFileTypes=".pdf,.jpg,.jpeg,.png"
            onAttachmentAdded={(attachment) =>
              addAttachmentToProcurement(procurement.id, attachment)
            }
          />
          <p className="text-xs text-muted-foreground">
            Glissez-déposez la facture ou les bons de livraison associés.
          </p>
        </div>
      </CardGrid>
    </div>
  )
}
