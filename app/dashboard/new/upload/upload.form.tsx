'use client'
import { Separator } from '@/components/ui/separator'
import { UploadedFile, Uploader } from '../../../../components/uploader'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/icons'
import { Label } from '@/components/ui/label'
import { useOrder } from '@/components/new-order.provider'

interface Props {}

export const UploadForm: React.FC<Props> = ({}: Props) => {
  const router = useRouter()
  const { order, setOrder } = useOrder()

  function submitOrder(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    console.log(order)
  }

  function onFileUploaded(files: UploadedFile[]): void {
    if (files.length < 1) return
    setOrder((prev) => ({
      ...prev,
      attachements: files.map(({ fileId, uniqueName, url, type }) => ({
        id: fileId,
        name: uniqueName,
        url: url,
        type: type
      }))
    }))
  }

  async function onDeleteAttachment(attachmentId: number) {
    setOrder((prev) => ({
      ...prev,
      attachements: prev?.attachements?.filter(({ id }) => id == attachmentId)
    }))
  }

  return (
    <div className="space-y-6">
      <div className="relative space-y-3  border rounded-md p-3">
        <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
          pièce jointe
        </span>
        <Label className="capitalize">uploader une annexe</Label>
        <Uploader
          isShowDestination
          orderId={order?.id}
          onFilesUploaded={onFileUploaded}
          onDeleteAttachment={onDeleteAttachment}
          uploadPath={`data/orders/${order?.id || 'unknown'}`}
          initialAttachments={order?.attachements?.filter(({ url }) => {
            url === order.payment?.checkUrl
          })}
        />
      </div>
      <div className="flex flex-col items-end gap-4">
        <Separator />
        <div className="w-full flex justify-between">
          <Button
            className={'min-w-28'}
            onClick={(e) => {
              e.preventDefault()
              router.push('payment')
            }}
          >
            <Icons.arrowRight className="mr-2 w-4 text-secondary rotate-180" />
            {'Paiement'}
          </Button>
          <Button onClick={submitOrder} className="min-w-28" type="submit">
            {'Confirmer'}
            <Icons.check className="ml-2 w-4 text-secondary " />
          </Button>
        </div>
      </div>
    </div>
  )
}
