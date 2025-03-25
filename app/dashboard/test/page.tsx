import { Card } from '@/components/card'
import { WorkstationTracker } from '@/components/workstation-tracker'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card>
      <div className="max-w-sm">
        <WorkstationTracker />
      </div>
    </Card>
  )
}

export default Page
