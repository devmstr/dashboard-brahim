import { CalculatorForm } from '@/components/calculator.form'
import { Card } from '@/components/card'
import { DaysCalculatorDialog } from '@/components/days-calculator.dialog'
import { PaymentForm } from '@/components/payment.form'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card>
      <PaymentForm />
    </Card>
  )
}

export default Page
