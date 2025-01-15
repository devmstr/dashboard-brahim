import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { CardGrid } from '@/components/card'
import { Combobox } from '@/components/combobox'
import { Input } from '@/components/ui/input'
import { CAR_ENERGY_TYPES } from '@/config/global'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'

interface Props {
  onSubmit: (data: TypeOfCarSchema) => Promise<void>
  isLoading?: boolean
}

export const carSchema = z.object({
  brand: z.string().optional(),
  car: z.string(),
  year: z.string(),
  fuel: z.string(),
  model: z.string().optional()
})
export type TypeOfCarSchema = z.infer<typeof carSchema>

export const NewCarForm: React.FC<Props> = ({ onSubmit, isLoading }: Props) => {
  const form = useForm<TypeOfCarSchema>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      year: new Date().getFullYear().toString(),
      fuel: 'Diesel'
    }
  })

  return (
    <Form {...form}>
      <form
        onClick={(e) => {
          e.stopPropagation()
        }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 pt-2"
      >
        <div className="relative border rounded-md px-3 py-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            Véhicule
          </span>
          <CardGrid>
            <FormField
              control={form.control}
              name="brand"
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
              name="car"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">{'Véhicule'}</FormLabel>
                  <FormControl>
                    <Input {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
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
              name="fuel"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">{'énergie'}</FormLabel>
                  <FormControl>
                    <Combobox
                      {...field}
                      id="fuel"
                      selections={CAR_ENERGY_TYPES}
                      setSelected={(v) => form.setValue('fuel', v)}
                      selected={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">{'année'}</FormLabel>
                  <FormControl>
                    <Input {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardGrid>
        </div>
        <div className="pt-3 flex flex-col items-end gap-4">
          <Separator />
          <Button className="px-4 min-w-24" type="submit">
            {isLoading ? (
              <Icons.spinner className="w-4 h-4 animate-spin" />
            ) : (
              'Ajouter'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
