import { Combobox } from '@/components/combobox'
import { Switcher } from '@/components/switcher'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  CLAMPING_TYPES,
  COLLECTOR_MATERIALS_TYPES,
  COLLECTOR_POSITION_TYPES,
  FINS_SIZES,
  FINS_TYPES,
  PERFORATION_TYPES,
  TUBE_TYPES
} from '@/config/global'
import { useEffect, useState } from 'react'
import { AddOrderSchemaType, InputNameType } from '../add-order.dialog'
import { number } from 'zod'

interface Props {
  data: AddOrderSchemaType
  onChange: (name: InputNameType, value: any) => void
}

export const TechnicalDataForm: React.FC<Props> = ({
  onChange,
  data: input
}: Props) => {
  const [data, setData] = useState(input)
  useEffect(() => {
    setData(input)
  }, [input])

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      lowerCollectorDepth: data.collectorDepth,
      lowerCollectorWidth: data.collectorWidth,
      lowerCollectorLength: data.collectorLength
    }))
  }, [data.isLowerCollectorDeferent])

  return (
    <form className="space-y-4 pt-2">
      <div className="relative border rounded-md px-3 pb-3">
        <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
          Véhicule
        </span>
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
      <div className="relative border rounded-md px-3 pb-3">
        <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
          faisceau
        </span>
        <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
          <div className=" w-full space-y-2">
            <Label htmlFor="coreLength">{'Longueur'}</Label>
            <Input
              id="coreLength"
              name="coreLength"
              value={data?.coreLength}
              type="number"
              className="w-full"
              onChange={({ target: { value: v } }) => onChange('coreLength', v)}
            />
          </div>
          <div className=" w-full space-y-2">
            <Label htmlFor="coreWidth">{'Largeur'}</Label>
            <Input
              id="coreWidth"
              name="coreWidth"
              value={data?.coreWidth}
              type="number"
              className="w-full"
              onChange={({ target: { value: v } }) => onChange('coreWidth', v)}
            />
          </div>
          <div className=" w-full space-y-2">
            <Label htmlFor="layersNumber">{'Nombre De Rangées (N°R)'}</Label>
            <Input
              id="layersNumber"
              name="layersNumber"
              value={data?.layersNumber}
              type="number"
              className="w-full"
              onChange={({ target: { value: v } }) =>
                onChange('layersNumber', v)
              }
            />
          </div>
        </div>
        <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
          <div className=" w-full space-y-2">
            <Label htmlFor="fins">{'Ailette'}</Label>
            <Combobox
              id="fins"
              options={FINS_TYPES}
              onSelect={(v) => {
                if (
                  (v === 'Zigzag' && data.tubePitch === 11) ||
                  ((v === 'Droite (Aérer)' || v === 'Droite (Normale)') &&
                    data.tubePitch === 12)
                )
                  setData({ ...data, tubePitch: 10 })
                onChange('fins', v)
              }}
              selected={data.fins}
            />
          </div>
          <div className=" w-full space-y-2">
            <Label htmlFor="tube">{'Tube'}</Label>
            <Combobox
              id="tube"
              options={TUBE_TYPES}
              onSelect={(v) => {
                onChange('tube', v)
              }}
              selected={data.tube}
            />
          </div>
          <div className=" w-full space-y-2">
            <Label htmlFor="tubePitch">{'Pas Des Tubes'}</Label>
            <Combobox
              id="tubePitch"
              options={
                data.fins == 'Zigzag'
                  ? FINS_SIZES.filter((i) => i == 12 || i == 10).map((i) =>
                      i.toString()
                    )
                  : FINS_SIZES.filter((i) => i != 12).map((i) => i.toString())
              }
              onSelect={(v) => {
                onChange('tubePitch', v)
              }}
              selected={data.tubePitch?.toString()}
            />
          </div>
        </div>
      </div>
      <div className="relative border rounded-md px-3 py-3">
        <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
          collecteurs
        </span>

        <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <Label htmlFor="isCollectorTinned" className="capitalize">
              {'Étamé'}
            </Label>
            <Switcher
              id="isCollectorTinned"
              checked={data.isCollectorTinned as boolean}
              onCheckedChange={(v) => onChange('isCollectorTinned', v)}
            />
          </div>
          <div className=" w-full space-y-2">
            <Label htmlFor="collectorMaterial">{'Matière'}</Label>
            <Combobox
              id="collectorMaterial"
              options={COLLECTOR_MATERIALS_TYPES}
              onSelect={(v) => onChange('collectorMaterial', v)}
              selected={data.collectorMaterial}
            />
          </div>
          <div className=" w-full space-y-2">
            <Label htmlFor="collectorType">{'Serrage'}</Label>
            <Combobox
              id="collectorType"
              options={
                data.coolingSystem == 'Air' || data.coolingSystem == 'Huile'
                  ? CLAMPING_TYPES.filter((i) => i != 'Boulonné')
                  : CLAMPING_TYPES
              }
              onSelect={(v) => onChange('collectorType', v)}
              selected={data.collectorType}
            />
          </div>
          {data.collectorType == 'Boulonné' && (
            <div className=" w-full space-y-2">
              <Label htmlFor="perforation">{'Perforation'}</Label>
              <Combobox
                id="perforation"
                options={PERFORATION_TYPES}
                selected={data.perforation}
                onSelect={(v) => {
                  onChange('perforation', v)
                }}
              />
            </div>
          )}

          <div className=" w-full space-y-2">
            <Label htmlFor="collectorPosition">{'Positionnement'}</Label>
            <Combobox
              id="collectorPosition"
              options={COLLECTOR_POSITION_TYPES}
              onSelect={(v) => {
                onChange('collectorPosition', v)
              }}
              selected={data.collectorPosition}
            />
          </div>
        </div>
        <div className="pt-5">
          {data.isLowerCollectorDeferent && (
            <span className="text-xs text-muted-foreground/50 uppercase ">
              {'Collecteur Haut'}
            </span>
          )}
          <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
            <div className=" w-full space-y-2">
              <Label htmlFor="collectorLength">{'Longueur'}</Label>
              <Input
                id="collectorLength"
                name="collectorLength"
                value={data?.collectorLength}
                type="number"
                className="w-full"
                onChange={({ target: { value: v } }) =>
                  onChange('collectorLength', v)
                }
              />
            </div>
            <div className=" w-full space-y-2">
              <Label htmlFor="collectorWidth">{'Largeur'}</Label>
              <Input
                id="collectorWidth"
                name="collectorWidth"
                value={data?.collectorWidth}
                type="number"
                className="w-full"
                onChange={({ target: { value: v } }) =>
                  onChange('collectorWidth', v)
                }
              />
            </div>
            <div className=" w-full space-y-2">
              <Label htmlFor="collector">{'Épaisseur'}</Label>
              <Input
                id="collector"
                name="collector"
                value={data.collectorDepth}
                className="w-full"
                type="number"
                onChange={({ target: { value: v } }) => {
                  onChange('collectorDepth', v)
                }}
              />
            </div>
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label htmlFor="isLowerCollectorDeferent" className="capitalize">
                {'Dimensions différentes '}
              </Label>
              <Switcher
                id="isLowerCollectorDeferent"
                checked={data.isLowerCollectorDeferent}
                onCheckedChange={(v) => {
                  onChange('isLowerCollectorDeferent', v)
                }}
              />
            </div>
          </div>
        </div>
        {data.isLowerCollectorDeferent && (
          <div className="pt-5">
            <span className="text-xs text-muted-foreground/50 uppercase  ">
              {'Collecteur Bas'}
            </span>
            <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
              <div className=" w-full space-y-2">
                <Label htmlFor="lowerCollectorLength">{'Longueur'}</Label>
                <Input
                  id="lowerCollectorLength"
                  name="lowerCollectorLength"
                  value={data.lowerCollectorLength}
                  type="number"
                  className="w-full"
                  onChange={({ target: { value: v } }) =>
                    onChange('lowerCollectorLength', v)
                  }
                />
              </div>
              <div className=" w-full space-y-2">
                <Label htmlFor="lowerCollectorWidth">{'Largeur'}</Label>
                <Input
                  id="lowerCollectorWidth"
                  name="lowerCollectorWidth"
                  value={data.lowerCollectorWidth}
                  type="number"
                  className="w-full"
                  onChange={({ target: { value: v } }) =>
                    onChange('lowerCollectorWidth', v)
                  }
                />
              </div>

              <div className=" w-full space-y-2">
                <Label htmlFor="lowerCollectorDepth">{'Épaisseur'}</Label>
                <Input
                  id="lowerCollectorDepth"
                  name="lowerCollectorDepth"
                  value={data.lowerCollectorDepth}
                  className="w-full"
                  type="number"
                  onChange={({ target: { value: v } }) => {
                    onChange('lowerCollectorDepth', v)
                  }}
                  disabled={data.collectorType == 'Boulonné'}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
