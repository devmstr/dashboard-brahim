import { Card } from '@/components/card'
import { getItemById } from '@/lib/procurement/actions'
import { notFound } from 'next/navigation'
import { ItemForm } from '../_components/item.form'

interface PageProps {
  params: {
    itemId: string
  }
}

const Page = async ({ params }: PageProps) => {
  const item = await getItemById(params.itemId)

  if (!item) notFound()

  const formDefaults = {
    name: item.name,
    sku: item.sku ?? '',
    description: item.description ?? '',
    unit: item.unit ?? '',
    isActive: item.isActive
  }

  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Article</h1>
        <p className="text-sm text-muted-foreground">
          Modifiez les informations de l'article.
        </p>
      </div>
      <ItemForm itemId={item.id} defaultValues={formDefaults} />
    </Card>
  )
}

export default Page
