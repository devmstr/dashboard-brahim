import { Card } from '@/components/card'
import { ClientForm } from '@/components/client.form'
import React from 'react'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <Card>
      <ClientForm countries={[]} provinces={[]} data={{}} />
    </Card>
  )
}

export default Page
