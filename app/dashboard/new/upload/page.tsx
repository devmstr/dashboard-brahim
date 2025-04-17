import { Card } from '@/components/card'
import { UploadForm } from './upload.form'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card className="max-w-6xl mx-auto">
      <UploadForm />
    </Card>
  )
}

export default Page
