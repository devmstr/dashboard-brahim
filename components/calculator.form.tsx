'use client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'
import { CardDivider } from './card'
import { Selector } from './selector'
import { PAS_TYPES } from '@/config/order.config'
import { LEVELS, TYPES, SIZES } from '@/config/calculator.config'
import { useOrder } from './new-order.provider'

interface CalculatorFormProps {}

type Type = 'Platte' | 'Zigzag'
type Size = 'Petit' | 'Moyen' | 'Grand'
type Level = 'Niveau 1' | 'Niveau 2' | 'Niveau 3'

const radiateurCapacities = {
  'Niveau 1': 12,
  'Niveau 2': 7,
  'Niveau 3': 4
}

const faisceauCapacities = {
  Platte: {
    Petit: 12,
    Moyen: 7,
    Grand: 4
  },
  Zigzag: {
    Petit: 35,
    Moyen: 25,
    Grand: 15
  }
}

const getRadiatorCapacity = (level: Level) => radiateurCapacities[level]
const getFaisceauCapacity = (type: Type, size: Size) =>
  faisceauCapacities[type] && faisceauCapacities[type][size]

export const CalculatorForm: React.FC<
  CalculatorFormProps
> = ({}: CalculatorFormProps) => {
  const [level, setLevel] = useState<Level>('Niveau 1')
  const [nr, setNr] = useState(1)
  const [days, setDays] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [size, setSize] = useState<Size>('Petit')
  const [type, setType] = useState<Type>('Platte')
  const [model, setModel] = useState<string>('faisceau')

  useEffect(() => console.log(days), [days])

  const calculate = () => {
    let capacity
    if (model == 'faisceau') capacity = getFaisceauCapacity(type, size)
    else capacity = getRadiatorCapacity(level)
    setDays((quantity * 390) / (capacity * nr))
  }
  function formatTime(totalMinutes: number): string {
    const days = Math.floor(totalMinutes / (24 * 60))
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60)
    const minutes = Math.floor(totalMinutes % 60)

    const parts = [
      days > 0 ? `${days}j` : '',
      hours > 0 ? `${hours}h` : '',
      minutes > 0 ? `${minutes}m` : ''
    ].filter(Boolean)

    return parts.join(' ') || '0m'
  }
  return (
    <div className="space-y-6 pt-5">
      <Tabs defaultValue={model} onValueChange={setModel}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="faisceau">Faisceau</TabsTrigger>
          <TabsTrigger value="radiateur">Radiateur</TabsTrigger>
        </TabsList>
        <TabsContent value="radiateur">
          <Card className="pt-3">
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label>Niveau</Label>
                <Selector
                  className="w-48"
                  items={LEVELS}
                  setValue={(v) => setLevel(v as Level)}
                  value={level || LEVELS[0]}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="nr">N°R</Label>
                <Input
                  id="nr"
                  type="number"
                  defaultValue={nr}
                  onChange={({ target: { value } }) => setNr(parseInt(value))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="quantity">Quantité</Label>
                <Input
                  id="quantity"
                  type="number"
                  defaultValue={quantity}
                  onChange={({ target: { value } }) =>
                    setQuantity(parseInt(value))
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={calculate}>
                Calculer
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="faisceau">
          <Card className="pt-4">
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label>Type</Label>
                <Selector
                  items={TYPES}
                  setValue={(v) => setType(v as Type)}
                  value={type}
                />
              </div>
              <div className="space-y-1">
                <Label>Taille</Label>
                <Selector
                  className="w-48"
                  items={SIZES}
                  setValue={(v) => setSize(v as Size)}
                  value={size || SIZES[0]}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="nr">N°R</Label>
                <Input
                  id="nr"
                  type="number"
                  defaultValue={nr}
                  onChange={({ target: { value } }) => setNr(parseInt(value))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="quantity">Quantité</Label>
                <Input
                  id="quantity"
                  type="number"
                  defaultValue={quantity}
                  onChange={({ target: { value } }) =>
                    setQuantity(parseInt(value))
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="w-full">
              <Button className="w-full" onClick={calculate}>
                Calculer
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="w-full m-auto p-5 rounded-md bg-gray-200/70 flex gap-1 items-end">
        <span className="text-primary font-bold text-4xl ">
          {formatTime(days)}
        </span>
      </div>
    </div>
  )
}
