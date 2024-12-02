import { CalculatorForm } from '@/components/calculator.form'
import { Card } from '@/components/card'
import { DaysCalculatorDialog } from '@/components/days-calculator.dialog'
import { PaymentForm } from '@/components/payment.form'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card>
      <div className="w-full flex justify-end mb-2 ">
        <DaysCalculatorDialog />
      </div>
      <PaymentForm />
    </Card>
  )
}

export default Page
