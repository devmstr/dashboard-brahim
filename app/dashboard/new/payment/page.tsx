import { CalculatorForm } from '@/components/calculator.form'
import { Card } from '@/components/card'
import { DaysCalculatorDialog } from '@/components/days-calculator.dialog'
import { FileUploadArea } from '@/components/upload-file-area'
import { PaymentForm } from '@/app/dashboard/new/payment/payment.form'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card className="max-w-6xl mx-auto">
      <PaymentForm />
    </Card>
  )
}

export default Page
