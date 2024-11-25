'use client'
import { AutoComplete } from '@/components/auto-complete-input'
import { Combobox } from '@/components/combobox'
import { Switcher } from '@/components/switcher'
import { Input } from '@/components/ui/input'
import { COMPANY_LABELS_TYPE } from '@/config/global'
import { Label } from '@radix-ui/react-label'
import { useState } from 'react'
import { AddOrderSchemaType, InputNameType } from '../add-order.dialog'

interface Props {
  countries: { name: string }[]
  provinces: { name: string }[]
  data: AddOrderSchemaType
  onChange: (name: InputNameType, value: any) => void
}

export const ClientInfoForm: React.FC<Props> = ({
  onChange,
  data,
  countries,
  provinces
}: Props) => {
  const [isCompany, setIsCompany] = useState(data.isCompany)
  const [country, setCountry] = useState(data.country)
  const [province, setProvince] = useState(data.province)
  const [label, setLabel] = useState(COMPANY_LABELS_TYPE.at(4))
  return (
    <form className="space-y-4 pt-2">
      <div className="relative border rounded-md px-3 py-3">
        <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
          générale
        </span>
        <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <Label htmlFor="isCompany" className="capitalize">
              {'entreprise'}
            </Label>
            <Switcher
              id="isCompany"
              checked={isCompany}
              onCheckedChange={(v) => {
                onChange('isCompany', v)
                setIsCompany(v)
              }}
            />
          </div>
          {isCompany && (
            <div className="space-y-2">
              <Label htmlFor="label" className="capitalize  ">
                {'Forme juridique'}
              </Label>
              <Combobox
                id="label"
                topic=""
                items={COMPANY_LABELS_TYPE}
                setValue={(v) => {
                  onChange('label', v)
                  setLabel(v)
                }}
                value={label}
              />
            </div>
          )}
          <div className="space-y-2 w-full">
            <Label htmlFor="name" className="capitalize">
              {isCompany ? "nom d'entreprise" : 'nom du client'}
            </Label>
            <Input
              id="name"
              name="name"
              placeholder={isCompany ? "nom d'entreprise" : 'nom du client'}
              value={data.name}
              onChange={({ target: { value } }) => onChange('name', value)}
            />
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="phone" className="capitalize">
              {'telephone'}
            </Label>
            <Input
              id="phone"
              name="phone"
              placeholder={'0665238745'}
              value={data.phone}
              onChange={({ target: { value } }) => onChange('phone', value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="capitalize">
              {'email'}
            </Label>
            <Input
              id="email"
              name="email"
              placeholder="example@email.com"
              type="email"
              value={data.email}
              onChange={({ target: { value } }) => onChange('email', value)}
            />
          </div>

          {isCompany && (
            <div className="space-y-2">
              <Label htmlFor="website" className="capitalize max-w-xs">
                {'site web'}
              </Label>
              <Input
                className="max-w-sm"
                id="website"
                name="website"
                placeholder="https://"
                type="website"
                value={data.website}
                onChange={({ target: { value } }) => onChange('website', value)}
              />
            </div>
          )}
        </div>

        {isCompany && (
          <>
            <div className="space-y-4 items-end md:grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="rc" className="capitalize">
                  {'Register Commerciale (RC)'}
                </Label>
                <Input
                  id="rc"
                  name="rc"
                  placeholder="16/00-1234567A"
                  type="text"
                  value={data.rc}
                  onChange={({ target: { value } }) => onChange('rc', value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mf" className="capitalize">
                  {'Matricule Fiscale (MF)'}
                </Label>
                <Input
                  id="mf"
                  name="mf"
                  placeholder="163079123456789"
                  type="text"
                  value={data.mf}
                  onChange={({ target: { value } }) => onChange('mf', value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nif" className="capitalize">
                  {"Numéro d'identification fiscale (N°IF)"}
                </Label>
                <Input
                  id="nif"
                  name="nif"
                  placeholder="000016079123456"
                  type="text"
                  value={data.nif}
                  onChange={({ target: { value } }) => onChange('nif', value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nis" className="capitalize">
                  {"Numéro d'identification statistique (N°IS)"}
                </Label>
                <Input
                  id="nis"
                  name="nis"
                  placeholder="16-1234567-001"
                  type="text"
                  value={data.nis}
                  onChange={({ target: { value } }) => onChange('nis', value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai" className="capitalize">
                  {"Article D'Imposition (AI)"}
                </Label>
                <Input
                  id="ai"
                  name="ai"
                  placeholder="11103 2002 0004"
                  type="text"
                  value={data.ai}
                  onChange={({ target: { value } }) => onChange('ai', value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="na" className="capitalize">
                  {'Numéro d’agrément (N°A)'}
                </Label>
                <Input
                  id="na"
                  name="na"
                  placeholder="16-AGR-2023-001"
                  type="text"
                  value={data.na}
                  onChange={({ target: { value } }) => onChange('na', value)}
                />
              </div>
            </div>
          </>
        )}
      </div>
      <div className="relative border rounded-md px-3 pb-3">
        <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
          adresse
        </span>

        <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
          <div className="space-y-2">
            <Label htmlFor="country" className="capitalize">
              {'pays'}
            </Label>

            <AutoComplete
              items={countries.map(({ name }) => name)}
              setValue={(value) => {
                onChange('country', value)
                setCountry(value)
              }}
              value={country!}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="province" className="capitalize">
              {'Wilaya'}
            </Label>

            <AutoComplete
              items={provinces.map(({ name }) => name)}
              setValue={(value) => {
                onChange('province', value)
                setProvince(value)
              }}
              value={province || ''}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city" className="capitalize">
              {'Commune'}
            </Label>
            <Input
              id="city"
              name="city"
              placeholder="Commune..."
              type="text"
              value={data.city}
              onChange={({ target: { value } }) => onChange('city', value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="capitalize  ">
              {'adresse'}
            </Label>
            <Input
              id="address"
              name="address"
              placeholder="Rue de... or BP234 Ghardaia"
              type="text"
              value={data.address}
              onChange={({ target: { value } }) => onChange('address', value)}
            />
          </div>
          <div className="space-y-2 ">
            <Label htmlFor="zip" className="capitalize">
              {'Code Postal'}
            </Label>
            <Input
              id="zip"
              name="zip"
              placeholder="47001"
              type="text"
              value={data.zip}
              onChange={({ target: { value } }) => onChange('zip', value)}
            />
          </div>
        </div>
      </div>
    </form>
  )
}
