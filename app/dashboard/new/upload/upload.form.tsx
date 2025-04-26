'use client'
import { Separator } from '@/components/ui/separator'
import { Uploader } from '../../../../components/uploader'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/icons'
import { Label } from '@/components/ui/label'

interface Props {}

export const UploadForm: React.FC<Props> = ({}: Props) => {
  const router = useRouter()
  return (
    <div className="space-y-6">
      <div className="relative space-y-3  border rounded-md p-3">
        <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
          pièce jointe
        </span>
        <Label className="capitalize">uploader une annexe</Label>
        <Uploader isShowDestination uploadPath={'data/orders'} />
      </div>
      <div className="flex flex-col items-end gap-4">
        <Separator />
        <div className="w-full flex justify-between">
          <Button
            onClick={(e) => {
              e.preventDefault()
              router.push('payment')
            }}
            className={'min-w-28'}
            type="submit"
          >
            <Icons.arrowRight className="mr-2 w-4 text-secondary rotate-180" />
            {'Paiement'}
          </Button>
          <Button className="min-w-28" type="submit">
            {'Confirmer'}
            <Icons.check className="ml-2 w-4 text-secondary " />
          </Button>
        </div>
      </div>
    </div>
  )
}
