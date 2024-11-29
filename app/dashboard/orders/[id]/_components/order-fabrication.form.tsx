'use client'
import { Combobox } from '@/components/combobox'
import { Switcher } from '@/components/switcher'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  COOLING_SYSTEMS_TYPES,
  FABRICATION_TYPES,
  ORDER_TYPES,
  PACKAGING_TYPES,
  PAYMENT_TYPES
} from '@/config/global'
import React, { useEffect, useState } from 'react'
import { MdEditor } from '@/components/md-editor'
import {
  AddOrderSchemaType,
  InputNameType
} from '@/app/dashboard/timeline/add-order.dialog'
import Link from 'next/link'
import { DatePicker } from '@/components/date-picker'

interface Props {
  canEdit?: boolean
  data: AddOrderSchemaType
  onChange: (name: InputNameType, value: any) => void
}

export const OrderFabricationForm: React.FC<Props> = ({
  data: input,
  onChange,
  canEdit = false
}: Props) => {
  const [data, setData] = React.useState(input)
  const [date, setDate] = React.useState(new Date(data.endDate as string))
  useEffect(() => {
    setData(input)
  }, [input])
  return (
    <form className="relative pt-2 space-y-5">
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
      <div className="relative border rounded-md px-3 pb-3">
        <div className="flex items-center justify-between">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            Véhicule
          </span>
          <Link
            href={`/dashboard/clients/${'VEX2ET3C3'}`}
            className="absolute -top-[0.65rem] right-5 text-base font-light text-muted-foreground/40 uppercase -mt-[2px] bg-background px-3 rounded-md  hover:font-bold hover:text-secondary"
          >
            {'VEX2ET3C3'}
          </Link>
        </div>

        <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
          <div className=" w-full space-y-2">
            <Label htmlFor="brand">{'Marque'}</Label>
            <Input
              id="brand"
              name="brand"
              value={data?.brand}
              className="w-full"
              onChange={({ target: { value: v } }) => onChange('brand', v)}
            />
          </div>
          <div className=" w-full space-y-2">
            <Label htmlFor="model">{'Modèle'}</Label>
            <Input
              id="model"
              name="model"
              value={data?.model}
              className="w-full"
              onChange={({ target: { value: v } }) => onChange('model', v)}
            />
          </div>
          <div className=" w-full space-y-2">
            <Label htmlFor="carType">{'Type'}</Label>
            <Input
              id="carType"
              name="carType"
              value={data?.carType}
              className="w-full"
              onChange={({ target: { value: v } }) => onChange('carType', v)}
            />
          </div>
        </div>
      </div>
      <div className="relative border rounded-md px-3 py-3">
        <div className="flex items-center justify-between select-none">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase ">
            commande
          </span>
          <Link
            href={`/dashboard/orders/${'RAX346534'}`}
            className="absolute -top-[0.65rem] right-5 text-base font-light text-muted-foreground/40 uppercase -mt-[2px] bg-background px-3 rounded-md  hover:font-bold hover:text-secondary"
          >
            {'RAX346534'}
          </Link>
        </div>
        <div className="space-y-4 items-end md:grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.isModificationRequired && (
            <div className="md:col-span-2 lg:col-span-3 space-y-2">
              <Label htmlFor="isModificationRequired" className="capitalize">
                {'Les Modifications'}
              </Label>
              <MdEditor
                editorContentClassName="p-4 overflow-y-scroll overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-background scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
                className="w-full min-h-36 group"
                placeholder="Listez les changements à effectuer..."
                value={data.modification}
                isReadOnly={!canEdit}
                setValue={(markdown) => {
                  onChange('modification', markdown)
                }}
                autoFocus={false}
              />
            </div>
          )}
          <div className=" w-full space-y-2">
            <Label htmlFor="type">{'Type'}</Label>
            <Combobox
              id="type"
              items={ORDER_TYPES}
              setValue={(v) => {
                if (v == 'Faisceau') onChange('buildType', 'Confection')
                onChange('orderType', v)
              }}
              value={data.orderType}
            />
          </div>
          <div className=" w-full space-y-2">
            <Label htmlFor="buildType">{'Fabrication'}</Label>
            <Combobox
              id="buildType"
              items={
                data.orderType === 'Faisceau'
                  ? FABRICATION_TYPES.filter((i) => i !== 'Rénovation')
                  : FABRICATION_TYPES
              }
              setValue={(v) => {
                onChange('buildType', v)
              }}
              value={data.buildType}
            />
          </div>
          <div className=" w-full space-y-2">
            <Label htmlFor="quantity">{'Quantité'}</Label>
            <Input
              id="quantity"
              name="quantity"
              value={data.quantity}
              type="number"
              className="w-full"
              onChange={({ target: { value: v } }) => onChange('quantity', v)}
            />
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="coolingSystem">{'Refroidissement'}</Label>
            <Combobox
              id="buildType"
              items={COOLING_SYSTEMS_TYPES}
              setValue={(v) => {
                onChange('coolingSystem', v)
                if (v != 'Eau') onChange('collectorType', 'Plié')
              }}
              value={data.coolingSystem}
            />
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="packaging">{'Emballage'}</Label>
            <Combobox
              id="packaging"
              items={PACKAGING_TYPES}
              setValue={(v) => {
                onChange('packaging', v)
              }}
              value={data.packaging}
            />
          </div>
          {data.orderType && data.orderType === 'Autre' && (
            <div className="md:col-span-2 lg:col-span-3 space-y-2">
              <Label htmlFor="isModificationRequired" className="capitalize">
                {'Description de la commande'}
              </Label>
              <MdEditor
                editorContentClassName="p-4 overflow-y-scroll overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-background scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
                className="w-full min-h-36 group"
                placeholder="Décrivez ce que vous souhaitez..."
                value={data.otherChoseDescription}
                setValue={(markdown) => {
                  onChange('otherChoseDescription', markdown)
                }}
                autoFocus={false}
              />
            </div>
          )}
        </div>
      </div>
      <div className="relative border rounded-md px-3 pb-3">
        <div className="flex items-center justify-between select-none">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            paiement
          </span>
          <Link
            href={`/dashboard/orders/${'PAX3L6M34'}`}
            className="absolute -top-[0.65rem] right-5 text-base font-light text-muted-foreground/40 uppercase -mt-[2px] bg-background px-3 rounded-md  hover:font-bold hover:text-secondary"
          >
            {'PAX3L6M34'}
          </Link>
        </div>
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
          <div className=" w-full space-y-2">
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
              items={PAYMENT_TYPES}
              value={data.paymentMode}
              setValue={(v) => {
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
    </form>
  )
}
