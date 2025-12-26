import { notFound } from 'next/navigation'
import { getPurchaseOrderById } from '@/lib/procurement/actions'
import { PurchaseOrderPrint } from '../../_components/purchase-order-print'
import { PurchaseOrderPrinterWrapper } from '@/app/dashboard/printing/purchase-order-wrapper'

interface PageProps {
  params: {
    purchaseOrderId: string
  }
}

const Page = async ({ params }: PageProps) => {
  const purchaseOrder = await getPurchaseOrderById(params.purchaseOrderId)

  if (!purchaseOrder) notFound()

  return (
    <PurchaseOrderPrinterWrapper data={{ reference: purchaseOrder.reference }}>
      <PurchaseOrderPrint data={purchaseOrder} />
    </PurchaseOrderPrinterWrapper>
  )
}

export default Page
