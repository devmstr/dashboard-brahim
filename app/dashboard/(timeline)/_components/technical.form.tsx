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
  TUBE_SIZES,
  TUBE_TYPES
} from '@/config/global'
import { useState } from 'react'
import { AddOrderSchemaType, InputNameType } from '../add-order.dialog'

interface Props {
  data: AddOrderSchemaType
  onChange: (name: InputNameType, value: any) => void
}

export const TechnicalDataForm: React.FC<Props> = ({
  onChange,
  data
}: Props) => {
  const [fins, setFins] = useState(data.fins)
  const [finsPitch, setFinsPitch] = useState(data.finsPitch)
  const [tube, setTube] = useState(data.tube)
  const [tubePitch, setTubePitch] = useState(data.tubePitch)
  const [clamping, setClamping] = useState(data.collectorType)
  const [collectorMaterial, setCollectorMaterial] = useState(
    data.collectorMaterial
  )
  const [collectorPosition, setCollectorPosition] = useState(
    data.collectorPosition
  )
  const [isCollectorTinned, setIsCollectorTinned] = useState(
    data.isCollectorTinned || false
  )
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
            <Label htmlFor="coreDepth">{'Épaisseur'}</Label>
            <Input
              id="coreDepth"
              name="coreDepth"
              value={data?.coreDepth}
              className="w-full"
              type="number"
              onChange={({ target: { value: v } }) => onChange('coreDepth', v)}
            />
          </div>
        </div>
        <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
          <div className=" w-full space-y-2">
            <Label htmlFor="fins">{'Ailette'}</Label>
            <Combobox
              id="fins"
              items={FINS_TYPES}
              setValue={(v) => {
                onChange('fins', v)
                if (v == 'Zigzag' && finsPitch == 11) setFinsPitch(10)
                if (
                  v == 'Droite (Aérer)' ||
                  (v == 'Droite (Normale)' && finsPitch == 12)
                )
                  setFinsPitch(10)
                setFins(v)
              }}
              value={fins}
            />
          </div>
          <div className=" w-full space-y-2">
            <Label htmlFor="finsPitch">{'Pas'}</Label>
            <Combobox
              id="finsPitch"
              items={
                fins == 'Zigzag'
                  ? FINS_SIZES.filter((i) => i == 12 || i == 10).map((i) =>
                      i.toString()
                    )
                  : FINS_SIZES.filter((i) => i != 12).map((i) => i.toString())
              }
              setValue={(v) => {
                onChange('finsPitch', v)
                setFinsPitch(Number(v))
              }}
              value={finsPitch?.toString()}
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
            <Label htmlFor="tube">{'Tube'}</Label>
            <Combobox
              id="tube"
              items={TUBE_TYPES}
              setValue={(v) => {
                onChange('tube', v)
                setTube(v)
              }}
              value={tube}
            />
          </div>
          <div className=" w-full space-y-2">
            <Label htmlFor="tubePitch">{'Entre Tube'}</Label>
            <Combobox
              id="tubePitch"
              items={TUBE_SIZES.map((i) => i.toString())}
              setValue={(v) => {
                onChange('tubePitch', v)
                setTubePitch(Number(v))
              }}
              value={tubePitch?.toString()}
            />
          </div>
        </div>
      </div>
      <div className="relative border rounded-md px-3 py-3">
        <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
          collecteur
        </span>

        <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <Label htmlFor="isCollectorTinned" className="capitalize">
              {'Étamé'}
            </Label>
            <Switcher
              id="isCollectorTinned"
              checked={isCollectorTinned}
              onCheckedChange={(v) => {
                onChange('isCollectorTinned', v)
                setIsCollectorTinned(v)
              }}
            />
          </div>
          <div className=" w-full space-y-2">
            <Label htmlFor="collectorMaterial">{'Matière'}</Label>
            <Combobox
              id="collectorMaterial"
              items={COLLECTOR_MATERIALS_TYPES}
              setValue={(v) => {
                onChange('collectorMaterial', v)
                setCollectorMaterial(v)
              }}
              value={collectorMaterial}
            />
          </div>
          <div className=" w-full space-y-2">
            <Label htmlFor="collectorType">{'Serrage'}</Label>
            <Combobox
              id="collectorType"
              items={
                data.coolingSystem == 'Air' || data.coolingSystem == 'Huile'
                  ? CLAMPING_TYPES.filter((i) => i != 'Boulonné')
                  : CLAMPING_TYPES
              }
              setValue={(v) => {
                onChange('collectorType', v)
                setClamping(v)
              }}
              value={clamping}
            />
          </div>

          <div className=" w-full space-y-2">
            <Label htmlFor="collectorPosition">{'Positionnement'}</Label>
            <Combobox
              id="collectorPosition"
              items={COLLECTOR_POSITION_TYPES}
              setValue={(v) => {
                onChange('collectorPosition', v)
                setCollectorPosition(v)
              }}
              value={collectorPosition}
            />
          </div>
        </div>
      </div>
    </form>
  )
}
