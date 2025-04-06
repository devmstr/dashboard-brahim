import { Card } from '@/components/card'
import { SONERAS_COMPANY_DETAILS } from '@/components/inventory.table'
import { PrintProductLabel } from '@/components/print-product-label'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card>
      <PrintProductLabel
        companyData={SONERAS_COMPANY_DETAILS}
        designation={'RA 0530X0540 4D7 10 0545X085 PC KOMATSU FD60'}
        qrCode={'RAX5H7MNT'}
        barcode={'6137045654432'}
      />
    </Card>
  )
}

export default Page
