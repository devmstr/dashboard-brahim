'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@radix-ui/react-select'
import { Selector } from '@/components/selector'
import { Textarea } from '@/components/ui/textarea'
import { AddOrderSchemaType, InputNameType } from '../add-order.dialog'

import { Switcher } from '@/components/switcher'
import React, { useState } from 'react'
import { Combobox } from '@/components/combobox'
import {
  COOLING_SYSTEMS_TYPES,
  FABRICATION_TYPES,
  ORDER_TYPES,
  PACKAGING_TYPES,
  PAYMENT_TYPES
} from '@/config/global'
import { DatePicker } from '@/components/date-picker-obti'

interface Props {
  data: AddOrderSchemaType
  onChange: (name: InputNameType, value: any) => void
}

export const PaymentForm: React.FC<Props> = ({ data, onChange }: Props) => {
  const [mode, setMode] = useState(data?.paymentMode)
  const [price, setPrice] = useState(data?.price)
  const [deposit, setDeposit] = useState(data?.deposit)
  const [endDate, setEndDate] = React.useState<Date>(
    new Date(data.endDate as string)
  )
  return (
    <form className="space-y-5 pt-2">
      <div className="relative border rounded-md px-3 pb-3">
        <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
          paiement
        </span>
        <div className="space-y-4 items-end md:grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className=" w-full space-y-2">
            <Label htmlFor="price" className="flex items-center gap-1">
              {'Prix estimé'}
              <span className="text-xs text-muted-foreground/50">
                {'(susceptible de changer)'}
              </span>
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={data?.price}
              className="w-full"
              onChange={({ target: { value } }) => {
                onChange('price', value)
                setPrice(Number(value))
              }}
            />
          </div>
          <div className=" w-full space-y-2">
            <Label htmlFor="deposit">{'Versement'}</Label>
            <Input
              id="deposit"
              name="deposit"
              type="number"
              value={data?.deposit}
              className="w-full"
              onChange={({ target: { value } }) => {
                onChange('deposit', value)
                setDeposit(Number(value))
              }}
            />
          </div>
          <div className=" w-full space-y-2">
            <Label htmlFor="remaining">{'Restant'}</Label>
            <Input
              id="remaining"
              name="remaining"
              type="number"
              value={price && deposit && price > deposit ? price - deposit : 0}
              className="w-full"
              onChange={() => {
                onChange(
                  'remaining',
                  price && deposit && price > deposit ? price - deposit : 0
                )
              }}
              disabled={true}
            />
          </div>
          <div className=" w-full space-y-2">
            <Label htmlFor="mode">{'Mode De Paiement'}</Label>
            <Combobox
              id="mode"
              items={PAYMENT_TYPES}
              setValue={(v) => {
                onChange('paymentMode', v)
                setMode(v)
              }}
              value={mode}
            />
          </div>
          {mode === 'Versement (Banque)' && (
            <div className=" w-full space-y-2">
              <Label htmlFor="iban">{'IBAN'}</Label>
              <Input
                id="iban"
                name="iban"
                value={data?.iban}
                className="w-full"
                onChange={({ target: { value } }) => onChange('iban', value)}
              />
            </div>
          )}
        </div>
      </div>
      <div className="relative border rounded-md px-3 pb-3">
        <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
          délais
        </span>
        <div className="space-y-4 items-end md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
          <div className=" w-full space-y-2">
            <Label className="flex items-center gap-1" htmlFor={'endDate'}>
              {'Délais estimé'}
              <span className="text-xs text-muted-foreground/50">
                {'(susceptible de changer)'}
              </span>
            </Label>
            <DatePicker
              id={'endDate'}
              value={endDate}
              className="w-full"
              onChange={(date) => {
                setEndDate(date)
                onChange('endDate', date.toISOString())
              }}
            />
          </div>
        </div>
      </div>
    </form>
  )
}
