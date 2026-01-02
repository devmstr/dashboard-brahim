import { Card } from '@/components/card'
import { ItemForm } from '../_components/item.form'
import { generateId } from '@/helpers/id-generator'

const Page = async () => {
  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Nouvel article</h1>
        <p className="text-sm text-muted-foreground">
          Creez un nouvel article fournisseur.
        </p>
      </div>
      <ItemForm
        defaultValues={{
          sku: generateId('PI')
        }}
      />
    </Card>
  )
}

export default Page
