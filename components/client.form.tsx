'use client'
import { AddOrderSchemaType } from '@/app/dashboard/timeline/add-order.dialog'
import { AutoComplete } from '@/components/auto-complete-input'
import { Combobox } from '@/components/combobox'
import { Switcher } from '@/components/switcher'
import { Input } from '@/components/ui/input'
import { COMPANY_LABELS_TYPE } from '@/config/global'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from './ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from './ui/form'
import { Separator } from './ui/separator'
import { clientSchema, ClientType } from '@/lib/validations'
import { useOrder } from './new-order.provider'
import { Icons } from './icons'
import CustomerSearchInput from './customer-search.input'
import { ClientTableEntry, Customer } from '@/types'
import { AddNewClientDialogButton } from './add-new-client.button'
import { ClientTable } from './client-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select'
import { Action } from '@radix-ui/react-toast'
import { MouseEventHandler, useState } from 'react'
import { Label } from './ui/label'

interface Props {
  data: Partial<AddOrderSchemaType>
}

export const ClientForm: React.FC<Props> = ({ data }: Props) => {
  const { order, setOrder } = useOrder()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const router = useRouter()
  const form = useForm<ClientType>({
    defaultValues: {
      isCompany: false,
      country: 'Algeria',
      label: COMPANY_LABELS_TYPE.at(4),
      province: 'Ghardia',
      city: 'Ghardia'
    },
    resolver: zodResolver(clientSchema)
  })

  const isCompany = form.watch('isCompany')
  const onSubmit = (formData: ClientType) => {
    setOrder((prev) => ({
      ...prev,
      client: formData
    }))
    router.replace('new/order')
  }

  // Simple button action component
  const renderRowActions = (rowData: ClientTableEntry) => {
    return (
      <Button
        variant={'outline'}
        onClick={() => {
          console.log('Full row data:', rowData)
          setCustomer({ ...rowData, company: rowData.label || '' })
        }}
      >
        Choisir
      </Button>
    )
  }

  return (
    <CustomerSearchInput
      customers={[]}
      selectedCustomer={customer}
      setSelectedCustomer={(customer: Customer | null) => {}}
    >
      <div className=" flex flex-col gap-4 w-full">
        <Label className="text-foreground">Derniers Acheteurs</Label>
        <ClientTable
          className=""
          renderActions={renderRowActions}
          showColumnSelector={false}
          showLimitSelector={false}
          showSearch={false}
          showPaginationButtons={false}
          data={[
            {
              id: 'CLX24DF4T',
              name: 'Mohamed',
              phone: '0658769361',
              label: '(SARL) GoldenRad ',
              location: 'Ghardaïa',
              orderCount: 10
            },
            {
              id: 'CLX89GJ7K',
              name: 'Amine',
              phone: '0667321984',
              label: '(EURL) Tech Innov',
              location: 'Alger',
              orderCount: 15
            },
            {
              id: 'CLX56TY9P',
              name: 'Nassim',
              phone: '0558743621',
              label: '(SARL) BuildProSociété',
              location: 'Oran',
              orderCount: 8
            },
            {
              id: 'CLX77MN3Q',
              name: 'Yacine',
              phone: '0678125496',
              label: '(SAS) GreenAgro',
              location: 'Constantine',
              orderCount: 20
            }
          ]}
        />
        <Separator />
        <div className="flex w-full justify-end">
          <Button
            onClick={() => router.push('new/order')}
            className="min-w-28"
            type="submit"
          >
            {'Commande'}
            <Icons.arrowRight className="ml-2 w-4 text-secondary" />
          </Button>
        </div>
      </div>
    </CustomerSearchInput>
  )
}
