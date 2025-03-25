import { Card } from '@/components/card'
import { ClientForm } from '@/components/client.form'
import CustomerSearchInput from '@/components/customer-search.input'
import { Customer } from '@/types'
import React from 'react'

interface Props {}

const Page: React.FC<Props> = ({}: Props) => {
  return (
    <div className="max-w-6xl mx-auto">
      <ClientForm data={{}} />
    </div>
  )
}

export default Page
