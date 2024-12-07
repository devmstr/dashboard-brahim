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
import React, { useEffect, useState } from 'react'
import { AddOrderSchemaType, InputNameType } from '../add-order.dialog'
import { MdEditor } from '@/components/md-editor'

interface Props {
  data: AddOrderSchemaType
  onChange: (name: InputNameType, value: any) => void
}

export const FabricationForm: React.FC<Props> = ({
  data: input,
  onChange
}: Props) => {
  const [data, setData] = React.useState(input)
  useEffect(() => {
    setData(input)
  }, [input])
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
              checked={data.isModificationRequired as boolean}
              onCheckedChange={(v) => {
                onChange('isModificationRequired', v)
              }}
            />
          </div>
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
                setValue={(markdown) => {
                  onChange('modification', markdown)
                }}
              />
            </div>
          )}

          <div className=" w-full space-y-2">
            <Label htmlFor="type">{'Type'}</Label>
            <Combobox
              id="type"
              selections={ORDER_TYPES}
              setSelected={(v) => {
                if (v == 'Faisceau') onChange('buildType', 'Confection')
                onChange('orderType', v)
              }}
              selected={data.orderType}
            />
          </div>
          <div className=" w-full space-y-2">
            <Label htmlFor="buildType">{'Fabrication'}</Label>
            <Combobox
              id="buildType"
              selections={
                data.orderType === 'Faisceau'
                  ? FABRICATION_TYPES.filter((i) => i !== 'Rénovation')
                  : FABRICATION_TYPES
              }
              setSelected={(v) => {
                onChange('buildType', v)
              }}
              selected={data.buildType}
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
              selections={COOLING_SYSTEMS_TYPES}
              setSelected={(v) => {
                onChange('coolingSystem', v)
                if (v != 'Eau') onChange('collectorType', 'Plié')
              }}
              selected={data.coolingSystem}
            />
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="packaging">{'Emballage'}</Label>
            <Combobox
              id="packaging"
              selections={PACKAGING_TYPES}
              setSelected={(v) => {
                onChange('packaging', v)
              }}
              selected={data.packaging}
            />
          </div>
          {data.orderType == 'Autre' && (
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
              />
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
