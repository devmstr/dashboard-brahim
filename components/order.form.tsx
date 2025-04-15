'use client'
import { Combobox } from '@/components/combobox'
import { MdEditor } from '@/components/md-editor'
import { Switcher } from '@/components/switcher'
import { Input } from '@/components/ui/input'
import {
  CAR_ENERGY_TYPES,
  CLAMPING_TYPES,
  COLLECTOR_MATERIALS_TYPES,
  COLLECTOR_POSITION_TYPES,
  COOLING_SYSTEMS_TYPES,
  FABRICATION_TYPES,
  FINS_TYPES,
  ORDER_TYPES,
  PACKAGING_TYPES,
  PERFORATION_TYPES,
  TUBE_TYPES
} from '@/config/global'
import { orderSchema, OrderType } from '@/lib/validations/order'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { CardGrid } from './card'
import { useOrder } from './new-order.provider'
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
import { useMutation, useQuery } from '@tanstack/react-query'
import { genTitle } from '@/lib/order-title-generator'
import { CarSelectionForm, Selection } from './car-selection.from'
import { toast } from '@/hooks/use-toast'
import { Label } from './ui/label'
import { generateProductTitle } from '@/lib/utils'

interface Props {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
}

export const OrderForm: React.FC<Props> = ({ setOpen }: Props) => {
  const { order, setOrder } = useOrder()
  const [isCollectorsDifferent, setIsCollectorsDifferent] =
    React.useState(false)
  const [isTechnicalExist, setIsTechnicalExist] = React.useState(false)
  const [carSelection, setCarSelection] = React.useState<Selection | undefined>(
    undefined
  )
  const [isModelAvailable, setIsModelAvailable] = React.useState(true)
  const [isModificationIncluded, setIdsModificationIncluded] =
    React.useState(false)
  const router = useRouter()
  const form = useForm<OrderType>({
    defaultValues: {
      type: 'Radiateur',
      fabrication: 'Confection',
      cooling: 'Eau',
      packaging: 'Carton',
      quantity: 1,
      core: {
        fins: 'D',
        finsPitch: 10,
        tube: '7',
        rows: 1,
        dimensions: {
          width: 0,
          height: 0
        }
      },
      collector: {
        isTinned: false,
        perforation: 'Perforé',
        tightening: 'P',
        position: 'C',
        material: 'Laiton',
        upperDimensions: {
          width: 0,
          height: 0,
          thickness: 1.5
        }
      }
    },
    resolver: zodResolver(orderSchema)
  })
  const type = form.watch('type')
  const tightening = form.watch('collector.tightening')
  const finsPitch = form.watch('core.finsPitch')
  const fins = form.watch('core.fins')
  const cooling = form.watch('cooling')
  const thickness = form.watch('collector.upperDimensions.thickness')
  const height = form.watch('collector.upperDimensions.height')
  const width = form.watch('collector.upperDimensions.width')

  const onSubmit = (formData: OrderType) => {
    if (!order)
      setOrder({
        components: []
      })
    if (!carSelection) {
      toast({
        title: 'Attention !',
        description:
          'Les informations sur le véhicule sont manquantes dans la commande.',
        variant: 'warning'
      })
    }
    const id = order?.components ? String(order?.components.length + 1) : '1'
    const title = generateProductTitle({
      core: {
        width: Number(formData.core?.dimensions?.width),
        height: Number(formData.core?.dimensions?.height)
      },
      collector: {
        width: Number(formData.collector?.upperDimensions?.width),
        height: Number(formData.collector?.upperDimensions?.height),
        lowerHeight: Number(formData.collector?.lowerDimensions?.height),
        lowerWidth: Number(formData.collector?.lowerDimensions?.width)
      },
      rows: formData.core?.rows,
      type: formData.type as 'Faisceaux' | 'Radiateur',
      fabrication: formData.fabrication as 'Renovation' | 'Confection',
      fins: formData.core?.fins as 'Z' | 'A' | 'D',
      finsPitch: formData.core?.finsPitch as 10 | 11 | 12 | 14,
      position: formData.collector?.position as 'C' | 'D',
      tightening: formData.collector?.tightening as 'P' | 'B',
      tube: formData.core?.tube as '7' | '9' | 'M'
    })
    console.log(title)
    setOrder((prev) => ({
      ...prev,
      components: [
        ...(prev?.components ?? []),
        {
          id,
          title,
          car: isModelAvailable
            ? {
                id: carSelection?.model?.id,
                model: carSelection?.model?.name,
                manufacture: carSelection?.brand?.name
              }
            : undefined,
          ...formData
        }
      ]
    }))

    if (setOpen) setOpen(false)
  }

  React.useEffect(() => {
    if (isCollectorsDifferent)
      form.setValue('collector.lowerDimensions', {
        thickness: thickness,
        width,
        height: height
      })
    else form.setValue('collector.lowerDimensions', undefined)
  }, [isCollectorsDifferent])

  return (
    <Form {...form}>
      <form className="pt-2 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="">
          <Label id="isModelAvailable">Véhicule</Label>
          <Switcher
            id="isModelAvailable"
            checked={isModelAvailable}
            onCheckedChange={(v) => {
              setIsModelAvailable(!isModelAvailable)
            }}
          />
        </div>

        {isModelAvailable ? (
          <CarSelectionForm onSelectChange={setCarSelection} />
        ) : (
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem className="group md:col-span-2 lg:col-span-3">
                <FormLabel className="capitalize">{'Remarque'}</FormLabel>
                <FormControl>
                  <MdEditor
                    editorContentClassName="p-4 overflow-y-scroll overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-background scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
                    className="w-full min-h-36 group"
                    placeholder="Ajouter Le Model Caterpillar D430 ..."
                    setValue={(markdown) => {
                      form.setValue('note', markdown)
                    }}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div className="space-y-2">
          <Label id="isModificationIncluded">Modifications</Label>
          <Switcher
            id="isModificationIncluded"
            checked={isModificationIncluded as boolean}
            onCheckedChange={(v) => {
              setIdsModificationIncluded(v)
            }}
          />
          {isModificationIncluded && (
            <FormField
              control={form.control}
              name="modification"
              render={({ field }) => (
                <FormItem className="group md:col-span-2 lg:col-span-3 ">
                  <FormLabel className="capitalize">
                    {'Les Modifications'}
                  </FormLabel>
                  <FormControl>
                    <MdEditor
                      editorContentClassName="p-4 overflow-y-scroll overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-background scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
                      className="w-full min-h-36 group"
                      placeholder="Listez les changements à effectuer..."
                      value={field.value}
                      setValue={(markdown) => {
                        form.setValue('modification', markdown)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        <div className="relative border rounded-md px-3 py-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase ">
            commande
          </span>
          <CardGrid>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">{'Type'}</FormLabel>
                  <FormControl>
                    <Combobox
                      {...field}
                      id="type"
                      options={ORDER_TYPES}
                      onSelect={(v) => {
                        if (v == 'Faisceau')
                          form.setValue('fabrication', 'Confection')
                        form.setValue('type', v)
                      }}
                      selected={field.value}
                      isInSideADialog
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fabrication"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">{'Fabrication'}</FormLabel>
                  <FormControl>
                    <Combobox
                      {...field}
                      id="fabrication"
                      options={
                        type === 'Faisceau'
                          ? FABRICATION_TYPES.filter((i) => i == 'Confection')
                          : FABRICATION_TYPES
                      }
                      onSelect={(v) => {
                        form.setValue('fabrication', v)
                      }}
                      selected={field.value}
                      isInSideADialog
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">{'Quantité'}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        const value = Number(e.target.value)
                        if (value > 0) form.setValue('quantity', value)
                      }}
                      type="number"
                      className=""
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cooling"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">
                    {'Refroidissement'}
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      {...field}
                      options={COOLING_SYSTEMS_TYPES}
                      onSelect={(v) => {
                        form.setValue('cooling', v)
                        if (v != 'Eau')
                          form.setValue('collector.tightening', 'Plié')
                      }}
                      selected={field.value}
                      isInSideADialog
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="packaging"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">{'Emballage'}</FormLabel>
                  <FormControl>
                    <Combobox
                      {...field}
                      id="packaging"
                      options={PACKAGING_TYPES}
                      onSelect={(v) => {
                        form.setValue('packaging', v)
                      }}
                      selected={field.value}
                      isInSideADialog
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type == 'Autre' && (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="group md:col-span-2 lg:col-span-3">
                    <FormLabel className="capitalize">
                      {'Description'}
                    </FormLabel>
                    <FormControl>
                      <MdEditor
                        editorContentClassName="p-4 overflow-y-scroll overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-background scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
                        className="w-full min-h-36 group"
                        placeholder="Description de la commande..."
                        setValue={(markdown) => {
                          form.setValue('description', markdown)
                        }}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardGrid>
        </div>
        {isTechnicalExist && (
          <div className="relative space-y-3 border rounded-md px-3 py-3 ">
            <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
              faisceau
            </span>
            <CardGrid className="">
              {type == 'Faisceau' && (
                <>
                  <FormField
                    control={form.control}
                    name="core.dimensions.height"
                    render={({ field }) => (
                      <FormItem className="group ">
                        <FormLabel className="capitalize">
                          {'Longueur'}
                          <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
                            {'(mm)'}
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            onChange={({ target: { value } }) =>
                              form.setValue(
                                'core.dimensions.height',
                                Number(value)
                              )
                            }
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="core.dimensions.width"
                    render={({ field }) => (
                      <FormItem className="group ">
                        <FormLabel className="capitalize">
                          {'Largeur'}
                          <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
                            {'(mm)'}
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={({ target: { value } }) =>
                              form.setValue(
                                'core.dimensions.width',
                                Number(value)
                              )
                            }
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <FormField
                control={form.control}
                name="core.rows"
                render={({ field }) => (
                  <FormItem className="group ">
                    <FormLabel className="capitalize">
                      {'Nombre De Rangées (N°R)'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={({ target: { value } }) =>
                          form.setValue('core.rows', Number(value))
                        }
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardGrid>
            <CardGrid>
              <FormField
                control={form.control}
                name="core.fins"
                render={({ field }) => (
                  <FormItem className="group ">
                    <FormLabel className="capitalize">{'Ailette'}</FormLabel>
                    <FormControl>
                      <Combobox
                        {...field}
                        options={FINS_TYPES}
                        onSelect={(v) => {
                          if (
                            (v === 'Zigzag' && finsPitch === 11) ||
                            ((v === 'Droite (Aérer)' ||
                              v === 'Droite (Normale)') &&
                              finsPitch === 12)
                          )
                            form.setValue('core.finsPitch', 10)
                          form.setValue('core.fins', v)
                        }}
                        selected={field.value}
                        isInSideADialog
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="core.tube"
                render={({ field }) => (
                  <FormItem className="group ">
                    <FormLabel className="capitalize">{'Tube'}</FormLabel>
                    <FormControl>
                      <Combobox
                        id="tube"
                        options={TUBE_TYPES}
                        onSelect={(v) => {
                          form.setValue('core.tube', v)
                        }}
                        selected={field.value}
                        isInSideADialog
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="core.finsPitch"
                render={({ field }) => (
                  <FormItem className="group ">
                    <FormLabel className="capitalize">
                      {'Pas Des Tubes'}
                    </FormLabel>
                    <FormControl>
                      <Combobox
                        {...field}
                        options={
                          fins == 'Zigzag' ? ['10', '12'] : ['10', '11', '14']
                        }
                        onSelect={(v) => {
                          form.setValue('core.finsPitch', Number(v))
                        }}
                        selected={field.value?.toString()}
                        isInSideADialog
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardGrid>
            {type == 'Faisceau' && (
              <div className="pt-5">
                <div className="relative space-y-3 border rounded-md px-3 py-3">
                  <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
                    collecteurs
                  </span>

                  <CardGrid>
                    <FormField
                      control={form.control}
                      name="collector.isTinned"
                      render={({ field }) => (
                        <FormItem className="w-full md:col-span-2 lg:col-span-3 ">
                          <FormLabel className="capitalize">
                            {'Étamé'}
                          </FormLabel>
                          <FormControl>
                            <Switcher
                              {...field}
                              checked={field.value as boolean}
                              onCheckedChange={(v) =>
                                form.setValue('collector.isTinned', v)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="collector.material"
                      render={({ field }) => (
                        <FormItem className="group ">
                          <FormLabel className="capitalize">
                            {'Matière'}
                          </FormLabel>
                          <FormControl>
                            <Combobox
                              options={COLLECTOR_MATERIALS_TYPES}
                              onSelect={(v) =>
                                form.setValue('collector.material', v)
                              }
                              selected={field.value}
                              isInSideADialog
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="collector.tightening"
                      render={({ field }) => (
                        <FormItem className="group ">
                          <FormLabel className="capitalize">
                            {'Serrage'}
                          </FormLabel>
                          <FormControl>
                            <Combobox
                              options={
                                ['Air', 'Huile'].includes(cooling)
                                  ? ['Plié']
                                  : CLAMPING_TYPES
                              }
                              onSelect={(v) =>
                                form.setValue('collector.tightening', v)
                              }
                              selected={field.value}
                              isInSideADialog
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {tightening == 'Boulonné' && (
                      <FormField
                        control={form.control}
                        name="collector.perforation"
                        render={({ field }) => (
                          <FormItem className="group ">
                            <FormLabel className="capitalize">
                              {'Perforation'}
                            </FormLabel>
                            <FormControl>
                              <Combobox
                                id="perforation"
                                options={PERFORATION_TYPES}
                                onSelect={(v) => {
                                  form.setValue('collector.perforation', v)
                                }}
                                selected={field.value}
                                isInSideADialog
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="collector.position"
                      render={({ field }) => (
                        <FormItem className="group ">
                          <FormLabel className="capitalize">
                            {'Positionnement'}
                          </FormLabel>
                          <FormControl>
                            <Combobox
                              options={COLLECTOR_POSITION_TYPES}
                              onSelect={(v) => {
                                form.setValue('collector.position', v)
                              }}
                              selected={field.value}
                              isInSideADialog
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardGrid>
                  <div className="pt-2">
                    <span className="text-xs text-muted-foreground/50 uppercase ">
                      {!isCollectorsDifferent
                        ? 'Dimensions (Haut/Bas)'
                        : 'Dimensions (Haut)'}
                    </span>
                  </div>
                  <CardGrid>
                    <FormField
                      control={form.control}
                      name="collector.upperDimensions.height"
                      render={({ field }) => (
                        <FormItem className="group ">
                          <FormLabel className="capitalize">
                            {'Longueur'}
                            <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
                              {'(mm)'}
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={({ target: { value } }) =>
                                form.setValue(
                                  'collector.upperDimensions.height',
                                  Number(value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="collector.upperDimensions.width"
                      render={({ field }) => (
                        <FormItem className="group ">
                          <FormLabel className="capitalize">
                            {'Largeur'}
                            <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
                              {'(mm)'}
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={({ target: { value } }) =>
                                form.setValue(
                                  'collector.upperDimensions.width',
                                  Number(value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="collector.upperDimensions.thickness"
                      render={({ field }) => (
                        <FormItem className="group ">
                          <FormLabel className="capitalize">
                            {'Épaisseur'}
                            <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
                              {'(mm)'}
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={({ target: { value } }) =>
                                form.setValue(
                                  'collector.upperDimensions.thickness',
                                  Number(value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardGrid>
                  {isCollectorsDifferent && (
                    <>
                      <div className="pt-2">
                        <span className="text-xs text-muted-foreground/50 uppercase ">
                          {'Dimensions (Bas)'}
                        </span>
                      </div>
                      <CardGrid>
                        <FormField
                          control={form.control}
                          name="collector.lowerDimensions.height"
                          render={({ field }) => (
                            <FormItem className="group ">
                              <FormLabel className="capitalize">
                                {'Longueur'}
                                <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
                                  {'(mm)'}
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={({ target: { value } }) =>
                                    form.setValue(
                                      'collector.lowerDimensions.height',
                                      Number(value)
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="collector.lowerDimensions.width"
                          render={({ field }) => (
                            <FormItem className="group ">
                              <FormLabel className="capitalize">
                                {'Largeur'}
                                <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
                                  {'(mm)'}
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={({ target: { value } }) =>
                                    form.setValue(
                                      'collector.lowerDimensions.width',
                                      Number(value)
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="collector.lowerDimensions.thickness"
                          render={({ field }) => (
                            <FormItem className="group ">
                              <FormLabel className="capitalize">
                                {'Épaisseur'}
                                <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
                                  {'(mm)'}
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={({ target: { value } }) =>
                                    form.setValue(
                                      'collector.lowerDimensions.thickness',
                                      Number(value)
                                    )
                                  }
                                  disabled={tightening == 'Boulonné'}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardGrid>
                    </>
                  )}
                  <Button
                    variant={'ghost'}
                    className="text-muted-foreground"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsCollectorsDifferent(!isCollectorsDifferent)
                    }}
                  >
                    {!isCollectorsDifferent
                      ? '+ Ajouter dimension (Bas) '
                      : '- Même dimension'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        <Button
          variant={'ghost'}
          className="text-muted-foreground"
          onClick={(e) => {
            e.preventDefault()
            setIsTechnicalExist(!isTechnicalExist)
          }}
        >
          {!isTechnicalExist
            ? '+ Ajouter les détails techniques'
            : '- Aucun détails techniques'}
        </Button>

        <div className="pt-3 flex flex-col items-end gap-4">
          <Separator />

          <Button className="w-24" type="submit">
            {'Ajouter'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
