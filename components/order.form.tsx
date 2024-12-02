'use client'
import { Combobox } from '@/components/combobox'
import { MdEditor } from '@/components/md-editor'
import { Switcher } from '@/components/switcher'
import { Input } from '@/components/ui/input'
import {
  CLAMPING_TYPES,
  COLLECTOR_MATERIALS_TYPES,
  COLLECTOR_POSITION_TYPES,
  COOLING_SYSTEMS_TYPES,
  FABRICATION_TYPES,
  FINS_SIZES,
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
import { useForm } from 'react-hook-form'
import { CardGrid } from './card'
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
import { useOrder } from './new-order.provider'

interface Props {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
}

export const OrderForm: React.FC<Props> = ({ setOpen }: Props) => {
  const { order, setOrder } = useOrder()
  const [isCollectorsDifferent, setIsCollectorsDifferent] =
    React.useState(false)
  const [isTechnicalExist, setIsTechnicalExist] = React.useState(false)
  const router = useRouter()
  const form = useForm<OrderType>({
    defaultValues: {
      type: 'Radiateur',
      fabrication: 'Confection',
      coolingSystem: 'Eau',
      packaging: 'Carton',
      quantity: 1,
      isModificationRequired: false,
      core: {
        fins: 'Droite (Normale)',
        tubePitch: 10,
        tube: 'Étiré 7 (ET7)',
        length: 700,
        width: 500,
        collector: {
          isTinned: false,
          perforation: 'Perforé',
          type: 'Plié',
          position: 'Centrer',
          material: 'Laiton',
          dimensions: {
            upper: {
              depth: 1.5
            }
          }
        }
      }
    },
    resolver: zodResolver(orderSchema)
  })
  const isModificationRequired = form.watch('isModificationRequired')
  const type = form.watch('type')
  const collectorType = form.watch('core.collector.type')
  const tubePitch = form.watch('core.tubePitch')
  const fins = form.watch('core.fins')
  const coolingSystem = form.watch('coolingSystem')

  const onSubmit = (formData: OrderType) => {
    if (!order)
      setOrder({
        components: []
      })
    const id = order?.components ? String(order?.components.length + 1) : '1'
    setOrder((prev) => ({
      ...prev,
      components: [
        ...(prev?.components ?? []),
        {
          id,
          ...formData
        }
      ]
    }))

    if (setOpen) setOpen(false)
  }

  React.useEffect(() => {
    const dimensions = form.getValues('core.collector.dimensions.upper')
    const dimensionsLower = form.getValues('core.collector.dimensions.upper')
    console.log(dimensions, dimensionsLower)
    if (isCollectorsDifferent) {
      form.setValue('core.collector.dimensions.lower.depth', dimensions?.depth)
      form.setValue('core.collector.dimensions.lower.width', dimensions?.width)
      form.setValue(
        'core.collector.dimensions.lower.length',
        dimensions?.length
      )
    }
    form.setValue('core.collector.dimensions.lower.depth', undefined)
    form.setValue('core.collector.dimensions.lower.width', undefined)
    form.setValue('core.collector.dimensions.lower.length', undefined)
  }, [isCollectorsDifferent])
  return (
    <Form {...form}>
      <form className="pt-2 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="relative border rounded-md px-3 py-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            Véhicule
          </span>
          <CardGrid>
            <FormField
              control={form.control}
              name="car.brand"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">{'Marque'}</FormLabel>
                  <FormControl>
                    <Input {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="car.model"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">{'Modèle'}</FormLabel>
                  <FormControl>
                    <Input {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="car.type"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">{'Type'}</FormLabel>
                  <FormControl>
                    <Input {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardGrid>
        </div>
        <div className="relative border rounded-md px-3 py-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase ">
            commande
          </span>
          <CardGrid>
            <FormField
              control={form.control}
              name="isModificationRequired"
              render={({ field }) => (
                <FormItem className="group md:col-span-2 lg:col-span-3 ">
                  <FormLabel className="capitalize">
                    {' '}
                    {'Nécessite une modification'}
                  </FormLabel>
                  <FormControl>
                    <Switcher
                      id="isModificationRequired"
                      checked={isModificationRequired as boolean}
                      onCheckedChange={(v) => {
                        form.setValue('isModificationRequired', v)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isModificationRequired && (
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
                      items={ORDER_TYPES}
                      setValue={(v) => {
                        if (v == 'Faisceau')
                          form.setValue('fabrication', 'Confection')
                        form.setValue('type', v)
                      }}
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
                      items={
                        type === 'Faisceau'
                          ? FABRICATION_TYPES.filter((i) => i == 'Confection')
                          : FABRICATION_TYPES
                      }
                      setValue={(v) => {
                        form.setValue('fabrication', v)
                      }}
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
                    <Input {...field} type="number" className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coolingSystem"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">
                    {'Refroidissement'}
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      {...field}
                      items={COOLING_SYSTEMS_TYPES}
                      setValue={(v) => {
                        form.setValue('coolingSystem', v)
                        // if (v != 'Eau') form.setValue('collectorType', 'Plié')
                      }}
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
                      items={PACKAGING_TYPES}
                      setValue={(v) => {
                        form.setValue('packaging', v)
                      }}
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
                        placeholder="Décrivez ce que vous souhaitez..."
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
              <FormField
                control={form.control}
                name="core.length"
                render={({ field }) => (
                  <FormItem className="group ">
                    <FormLabel className="capitalize">{'Longueur'}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={({ target: { value } }) =>
                          form.setValue('core.length', Number(value))
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
                name="core.width"
                render={({ field }) => (
                  <FormItem className="group ">
                    <FormLabel className="capitalize">{'Largeur'}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={({ target: { value } }) =>
                          form.setValue('core.width', Number(value))
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
                name="core.layers"
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
                          form.setValue('core.layers', Number(value))
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
                        items={FINS_TYPES}
                        setValue={(v) => {
                          if (
                            (v === 'Zigzag' && tubePitch === 11) ||
                            ((v === 'Droite (Aérer)' ||
                              v === 'Droite (Normale)') &&
                              tubePitch === 12)
                          )
                            form.setValue('core.tubePitch', 10)
                          form.setValue('core.fins', v)
                        }}
                        value={field.value?.toString()}
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
                        items={TUBE_TYPES}
                        setValue={(v) => {
                          form.setValue('core.tube', v)
                        }}
                        value={field.value?.toString()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="core.tubePitch"
                render={({ field }) => (
                  <FormItem className="group ">
                    <FormLabel className="capitalize">
                      {'Pas Des Tubes'}
                    </FormLabel>
                    <FormControl>
                      <Combobox
                        {...field}
                        items={
                          fins == 'Zigzag'
                            ? FINS_SIZES.filter((i) => i == 12 || i == 10).map(
                                (i) => i.toString()
                              )
                            : FINS_SIZES.filter((i) => i != 12).map((i) =>
                                i.toString()
                              )
                        }
                        setValue={(v) => {
                          form.setValue('core.tubePitch', Number(v))
                        }}
                        value={field.value?.toString()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardGrid>
            <div className="pt-5">
              {' '}
              <div className="relative space-y-3 border rounded-md px-3 py-3">
                <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
                  collecteurs
                </span>

                <CardGrid>
                  <FormField
                    control={form.control}
                    name="core.collector.isTinned"
                    render={({ field }) => (
                      <FormItem className="w-full md:col-span-2 lg:col-span-3 ">
                        <FormLabel className="capitalize">{'Étamé'}</FormLabel>
                        <FormControl>
                          <Switcher
                            {...field}
                            checked={field.value as boolean}
                            onCheckedChange={(v) =>
                              form.setValue('core.collector.isTinned', v)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="core.collector.material"
                    render={({ field }) => (
                      <FormItem className="group ">
                        <FormLabel className="capitalize">
                          {'Matière'}
                        </FormLabel>
                        <FormControl>
                          <Combobox
                            items={COLLECTOR_MATERIALS_TYPES}
                            setValue={(v) =>
                              form.setValue('core.collector.material', v)
                            }
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="core.collector.type"
                    render={({ field }) => (
                      <FormItem className="group ">
                        <FormLabel className="capitalize">
                          {'Serrage'}
                        </FormLabel>
                        <FormControl>
                          <Combobox
                            items={
                              ['Air', 'Huile'].includes(coolingSystem)
                                ? CLAMPING_TYPES.filter((i) => i == 'Plié')
                                : CLAMPING_TYPES
                            }
                            setValue={(v) =>
                              form.setValue('core.collector.type', v)
                            }
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {collectorType == 'Boulonné' && (
                    <FormField
                      control={form.control}
                      name="core.collector.perforation"
                      render={({ field }) => (
                        <FormItem className="group ">
                          <FormLabel className="capitalize">
                            {'Perforation'}
                          </FormLabel>
                          <FormControl>
                            <Combobox
                              id="perforation"
                              items={PERFORATION_TYPES}
                              value={field.value}
                              setValue={(v) => {
                                form.setValue('core.collector.perforation', v)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="core.collector.position"
                    render={({ field }) => (
                      <FormItem className="group ">
                        <FormLabel className="capitalize">
                          {'Positionnement'}
                        </FormLabel>
                        <FormControl>
                          <Combobox
                            items={COLLECTOR_POSITION_TYPES}
                            value={field.value}
                            setValue={(v) => {
                              form.setValue('core.collector.position', v)
                            }}
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
                    name="core.collector.dimensions.upper.length"
                    render={({ field }) => (
                      <FormItem className="group ">
                        <FormLabel className="capitalize">
                          {'Longueur'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={({ target: { value } }) =>
                              form.setValue(
                                'core.collector.dimensions.upper.length',
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
                    name="core.collector.dimensions.upper.width"
                    render={({ field }) => (
                      <FormItem className="group ">
                        <FormLabel className="capitalize">
                          {'Largeur'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={({ target: { value } }) =>
                              form.setValue(
                                'core.collector.dimensions.upper.width',
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
                    name="core.collector.dimensions.upper.depth"
                    render={({ field }) => (
                      <FormItem className="group ">
                        <FormLabel className="capitalize">
                          {'Épaisseur'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={({ target: { value } }) =>
                              form.setValue(
                                'core.collector.dimensions.upper.depth',
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
                        name="core.collector.dimensions.lower.length"
                        render={({ field }) => (
                          <FormItem className="group ">
                            <FormLabel className="capitalize">
                              {'Longueur'}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={({ target: { value } }) =>
                                  form.setValue(
                                    'core.collector.dimensions.lower.length',
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
                        name="core.collector.dimensions.lower.width"
                        render={({ field }) => (
                          <FormItem className="group ">
                            <FormLabel className="capitalize">
                              {'Largeur'}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={({ target: { value } }) =>
                                  form.setValue(
                                    'core.collector.dimensions.lower.width',
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
                        name="core.collector.dimensions.lower.depth"
                        render={({ field }) => (
                          <FormItem className="group ">
                            <FormLabel className="capitalize">
                              {'Épaisseur'}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={({ target: { value } }) =>
                                  form.setValue(
                                    'core.collector.dimensions.lower.depth',
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
