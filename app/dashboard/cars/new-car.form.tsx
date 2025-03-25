/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'

import { useCallback, useEffect, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  addNewRadiator,
  isRadiatorDimensionsExist,
  isCoreDimensionsExist
} from '@/lib/actions'
import { cn, debounce } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { PlusCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

// Define the form schema with zod
const radiatorFormSchema = z.object({
  fabrication: z.enum(['FAIS', 'RAD', 'RENO']),
  brand: z.string().trim().toUpperCase(),
  model: z.string().trim().toUpperCase(),
  coreHeight: z.coerce.number().positive(),
  coreWidth: z.coerce.number().positive(),
  rows: z.string().default('1'),
  fins: z.enum(['NL', 'TR', 'AERE']),
  finsPitch: z.enum(['10', '12']),
  tube: z.enum(['7', '9', 'P']),
  collectorHeight: z.coerce.number().positive(),
  collectorWidth: z.coerce.number().positive(),
  collectorPosition: z.enum(['C', 'D']),
  collectorTightening: z.enum(['P', 'B'])
})

export type RadiatorFormValues = z.infer<typeof radiatorFormSchema>

type AddRadiatorDialogProps = {}

export function AddRadiatorDialog({}: AddRadiatorDialogProps) {
  const [open, setOpen] = useState(false)
  const [isCoreExists, setIsCoreExists] = useState(false)
  const [isCollectorExists, setIsCollectorExists] = useState(false)
  const [isAdding, setAddingTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Initialize the form with react-hook-form
  const form = useForm<RadiatorFormValues>({
    resolver: zodResolver(radiatorFormSchema),
    defaultValues: {
      fabrication: 'FAIS',
      brand: '',
      model: '',
      coreHeight: undefined,
      coreWidth: undefined,
      rows: '1',
      fins: 'NL',
      finsPitch: '10',
      tube: '7',
      collectorHeight: undefined,
      collectorWidth: undefined,
      collectorPosition: 'C',
      collectorTightening: 'P'
    }
  })

  // Watch form values for validation
  const watchedCoreHeight = form.watch('coreHeight')
  const watchedCoreWidth = form.watch('coreWidth')
  const watchedCollectorHeight = form.watch('collectorHeight')
  const watchedCollectorWidth = form.watch('collectorWidth')
  const watchedFins = form.watch('fins')

  // Update finsPitch when fins changes
  useEffect(() => {
    if (watchedFins !== 'TR' && form.getValues('finsPitch') === '12') {
      form.setValue('finsPitch', '10')
    }
  }, [watchedFins, form])

  const checkCore = useCallback(
    debounce(async (entreCollecteur: number, largeur: number, rows: string) => {
      if (entreCollecteur && largeur) {
        const exists = await isCoreDimensionsExist(
          entreCollecteur,
          largeur,
          Number.parseInt(rows)
        )
        setIsCoreExists(exists)
      } else {
        setIsCoreExists(false)
      }
    }, 300),
    []
  )

  const checkCollector = useCallback(
    debounce(
      async (
        entreCollecteur: number,
        coreLargeur: number,
        longueur: number,
        largeur: number
      ) => {
        if (entreCollecteur && coreLargeur && longueur && largeur) {
          const exists = await isRadiatorDimensionsExist(
            entreCollecteur,
            coreLargeur,
            longueur,
            largeur
          )
          setIsCollectorExists(exists)
        } else {
          setIsCollectorExists(false)
        }
      },
      300
    ),
    []
  )

  // Check dimensions when values change
  useEffect(() => {
    const rows = form.getValues('rows')
    checkCore(watchedCoreHeight, watchedCoreWidth, rows)
  }, [watchedCoreHeight, watchedCoreWidth, form, checkCore])

  useEffect(() => {
    checkCollector(
      watchedCoreHeight,
      watchedCoreWidth,
      watchedCollectorHeight,
      watchedCollectorWidth
    )
  }, [
    watchedCoreHeight,
    watchedCoreWidth,
    watchedCollectorHeight,
    watchedCollectorWidth,
    checkCollector
  ])

  const onSubmit = (data: RadiatorFormValues) => {
    setAddingTransition(async () => {
      try {
        // Convert form data to FormData
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
          formData.append(key, value.toString())
        })

        await addNewRadiator(formData)
        router.refresh()
        toast({
          title: 'Succès',
          description: <p>Vous avez ajouté avec succès un nouveau radiateur</p>
        })
        setOpen(false)
        form.reset()
      } catch (error: any) {
        setError(error.message || 'Une erreur est survenue')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Ajouter <PlusCircle className="w-auto h-7 ml-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl pt-5 pb-2">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau radiateur</DialogTitle>
          <DialogDescription>
            Aucun radiateur correspondant n&apos;a été trouvé. Souhaitez-vous
            l&apos;ajouter comme un nouveau radiateur ?
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 pb-2"
          >
            <div className="grid gap-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold">Fabrication</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="fabrication"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fabrication</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Fabrication" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FAIS">Faiseaux</SelectItem>
                          <SelectItem value="RAD">Radiateur</SelectItem>
                          <SelectItem value="RENO">Renovation</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marque</FormLabel>
                      <FormControl>
                        <Input {...field} className="uppercase" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input {...field} className="uppercase" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid gap-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold">Faiseaux</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="coreHeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entre Collecteur</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                          className={cn(
                            isCoreExists && 'ring-2 ring-green-500',
                            'transition-all duration-200'
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coreWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Largeur</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                          className={cn(
                            isCoreExists && 'ring-2 ring-green-500',
                            'transition-all duration-200'
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rows"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rangés</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn(
                              isCoreExists && 'ring-2 ring-green-500',
                              'transition-all duration-200'
                            )}
                          >
                            <SelectValue placeholder="Select Rangée" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                            <SelectItem key={value} value={value.toString()}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fins"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aiellet</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn(
                              isCoreExists && 'ring-2 ring-green-500',
                              'transition-all duration-200'
                            )}
                          >
                            <SelectValue placeholder="Select Aiellet" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NL">Droite Normale</SelectItem>
                          <SelectItem value="TR">Zigzag</SelectItem>
                          <SelectItem value="AERE">Droite AERE</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="finsPitch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pas</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Pas" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          {watchedFins === 'TR' && (
                            <SelectItem value="12">12</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tube"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tube</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Tube Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="7">7</SelectItem>
                          <SelectItem value="9">9</SelectItem>
                          <SelectItem value="P">P</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid gap-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold">Collecteur</h3>
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="collectorHeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longueur</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                          className={cn(
                            isCollectorExists && 'ring-2 ring-green-500',
                            'transition-all duration-200'
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collectorWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Largeur</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                          className={cn(
                            isCollectorExists && 'ring-2 ring-green-500',
                            'transition-all duration-200'
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collectorPosition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Position" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="C">Centrée</SelectItem>
                          <SelectItem value="D">Dépacée</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collectorTightening"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serrage</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Serrage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="P">Pliée</SelectItem>
                          <SelectItem value="B">Boulonnée</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="w-full flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault()
                  setOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAdding}>
                Ajouter
              </Button>
              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
