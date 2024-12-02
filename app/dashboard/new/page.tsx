import { redirect } from 'next/navigation'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  redirect('new/client')
}

export default Page
