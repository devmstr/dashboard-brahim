import { Card } from '@/components/card'
import { UploadFile } from './upload-file'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card className="max-w-6xl mx-auto">
      <UploadFile />
    </Card>
  )
}

export default Page
