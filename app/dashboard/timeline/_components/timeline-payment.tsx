'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AddOrderSchemaType, InputNameType } from '../add-order.dialog'

import { Combobox } from '@/components/combobox'
import { DatePicker } from '@/components/date-picker'
import { PAYMENT_TYPES } from '@/config/global'
import React, { useEffect } from 'react'

interface Props {
  data: AddOrderSchemaType
  onChange: (name: InputNameType, value: any) => void
}

export const PaymentForm: React.FC<Props> = ({
  data: input,
  onChange
}: Props) => {
  const [date, setDate] = React.useState(new Date())
  const [data, setData] = React.useState(input)
  useEffect(() => {
    setData(input)
  }, [input])
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
              onChange={({ target: { value } }) => onChange('price', value)}
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
              }}
            />
          </div>
          <div className="w-full space-y-2">
            <Label htmlFor="remaining">{'Restant'}</Label>
            <Input
              id="remaining"
              name="remaining"
              type="number"
              value={
                data.price && data.deposit && data.price > data.deposit
                  ? data.price - data.deposit
                  : 0
              }
              className="w-full"
              onChange={() => {
                onChange(
                  'remaining',
                  data.price && data.deposit && data.price > data.deposit
                    ? data.price - data.deposit
                    : 0
                )
              }}
              disabled={true}
            />
          </div>
          <div className=" w-full space-y-2">
            <Label htmlFor="mode">{'Mode De Paiement'}</Label>
            <Combobox
              id="mode"
              selections={PAYMENT_TYPES}
              selected={data.paymentMode}
              setSelected={(v) => {
                onChange('paymentMode', v)
              }}
            />
          </div>
          {data.paymentMode === 'Versement (Banque)' && (
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
              id="endDate"
              className="w-full"
              // date={data.endDate ? new Date(data.endDate) : new Date()}
              date={date}
              // onDateChange={(date) => {
              //   console.log(date)
              //   onChange('endDate', date.toISOString())
              // }}
              onDateChange={(v) => {
                setDate(v)
                console.log(v)
              }}
            />
          </div>
        </div>
      </div>
    </form>
  )
}
