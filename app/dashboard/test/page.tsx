import { CarSelectionForm } from '@/components/car-selection.from'
import { Card } from '@/components/card'
import { SONERAS_COMPANY_DETAILS } from '@/components/inventory.table'
import { PrintProductLabel } from '@/components/print-product-label'
import ProductSearchInput, { Product } from '@/components/search-product.input'
import { Search } from './search'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card>
      <Search />
    </Card>
  )
}

export default Page
