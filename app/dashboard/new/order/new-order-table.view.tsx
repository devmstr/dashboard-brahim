'use client'

import { OrderArticlesTable } from '@/components/article.table'
import { Icons } from '@/components/icons'
import { useOrder } from '@/components/new-order.provider'
import { OrderForm } from '@/components/order.form'
import ProductSearchInput, { Product } from '@/components/search-product.input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {}

export const NewOrderTableForm: React.FC<Props> = ({}: Props) => {
  const router = useRouter()
  const { order, setOrder } = useOrder()
  const [open, setOpen] = useState(false)
  return (
    <div className="space-y-3">
      <ProductSearchInput
        selected={null}
        onSelectChange={function (product: Product | null): void {
          throw new Error('Function not implemented.')
        }}
      />
      <div>
        <OrderArticlesTable
          data={order?.components?.map(
            ({ id, title, car, fabrication, type, quantity }) => ({
              id: id as string,
              title: title as string,
              brand: car?.manufacture,
              model: car?.model,
              fabrication,
              type,
              quantity
            })
          )}
          className="rounded-b-none border-b-0"
        />
        <div className="flex flex-grow justify-center items-center h-full">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'flex w-full h-24 justify-center gap-1  text-muted-foreground rounded-none rounded-b-md border-muted-foreground/30  hover:bg-gray-100 text-md border-dashed broder-dash py-4',
                  order?.components?.length &&
                    order?.components?.length > 0 &&
                    'h-fit'
                )}
              >
                <Icons.plus className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
                <span className="text-base font-medium">
                  Ajouter Un Article
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="h-fit container max-w-5xl">
              <ScrollArea className="max-h-[80vh] pt-2 px-1 pr-2">
                <OrderForm setOpen={setOpen} />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="pt-3 flex flex-col items-end gap-4">
        <Separator />
        <div className="w-full flex justify-between">
          <Button
            onClick={() => router.push('/dashboard/new')}
            className={'min-w-28'}
            type="submit"
          >
            <Icons.arrowRight className="mr-2 w-4 text-secondary rotate-180" />
            {'Acheteur'}
          </Button>
          <Button onClick={() => router.push('payment')} className={'min-w-28'}>
            {'Paiement'}
            <Icons.arrowRight className="ml-2 w-4 text-secondary " />
          </Button>
        </div>
      </div>
    </div>
  )
}
