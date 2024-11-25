'use client'
import { Combobox } from '@/components/combobox'
import { Switcher } from '@/components/switcher'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  COOLING_SYSTEMS_TYPES,
  FABRICATION_TYPES,
  ORDER_TYPES,
  PACKAGING_TYPES
} from '@/config/global'
import React, { useState } from 'react'
import { AddOrderSchemaType, InputNameType } from '../add-order.dialog'

interface Props {
  data: AddOrderSchemaType
  onChange: (name: InputNameType, value: any) => void
}

export const FabricationForm: React.FC<Props> = ({ data, onChange }: Props) => {
  const [isModificationRequired, setIsModificationRequired] = useState(
    data.isModificationRequired!
  )
  const [type, setType] = useState(data.orderType)
  const [buildType, setBuildType] = useState(data.buildType)
  const [coolingSystem, setCoolingSystem] = useState(data.coolingSystem)
  const [packaging, setPackaging] = useState(data.packaging)
  return (
    <form className="pt-2">
      <div className="relative border rounded-md px-3 py-3">
        <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase ">
          commande
        </span>
        <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <Label htmlFor="isModificationRequired" className="capitalize">
              {'Nécessite une modification'}
            </Label>
            <Switcher
              id="isModificationRequired"
              checked={isModificationRequired}
              onCheckedChange={(v) => {
                onChange('isModificationRequired', v)
                setIsModificationRequired(v)
              }}
            />
          </div>
          <div className=" w-full space-y-2">
            <Label htmlFor="type">{'Type'}</Label>
            <Combobox
              id="type"
              items={ORDER_TYPES}
              setValue={(v) => {
                onChange('orderType', v)
                if (v == 'Faisceau') setBuildType('Confection')
                setType(v)
              }}
              value={type}
            />
          </div>
          <div className=" w-full space-y-2">
            <Label htmlFor="buildType">{'Fabrication'}</Label>
            <Combobox
              id="buildType"
              items={
                type === 'Faisceau'
                  ? FABRICATION_TYPES.filter((i) => i !== 'Rénovation')
                  : FABRICATION_TYPES
              }
              setValue={(v) => {
                onChange('buildType', v)
                setBuildType(v)
              }}
              value={buildType}
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
                setCoolingSystem(v)
              }}
              value={coolingSystem}
            />
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="packaging">{'Emballage'}</Label>
            <Combobox
              id="packaging"
              items={PACKAGING_TYPES}
              setValue={(v) => {
                onChange('packaging', v)
                setPackaging(v)
              }}
              value={packaging}
            />
          </div>
        </div>
      </div>
    </form>
  )
}
