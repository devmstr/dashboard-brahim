'use client'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import React, { useState, useTransition } from 'react'
import { ClientInfoForm } from './_components/timeline-client.form'
import { FabricationForm } from './_components/timeline-fabrication.form'
import { TechnicalDataForm } from './_components/timeline-technical.form'
import { StepIndicator } from './_components/step-indicator'
import { Icons } from '@/components/icons'
import { toast } from '@/components/ui/use-toast'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Dictionary } from '@/types'
import { Country, Daira, Wilaya } from '@prisma/client'
import { ScrollArea } from '@/components/scroll-area'
import { PaymentForm } from './_components/timeline-payment'
import { previousDay } from 'date-fns'
import { contentSchema } from '@/lib/validations'

const positiveNumberFromString = (name: string) =>
  z
    .string()
    .default('0')
    .transform((value) => {
      if (value === '') {
        return 0 // Convert empty string to 0
      }
      const parsed = Number(value)
      if (isNaN(parsed) || parsed < 0) {
        throw new Error(`Invalid ${name}: must be a positive number`)
      }
      return parsed
    })
    .optional() // Make it optional if required

// Define the Zod schema for employee data validation
export const addOrderSchema = z.object({
  isCompany: z.boolean().default(false),
  name: z.string().optional(),
  otherChoseDescription: contentSchema,
  modification: contentSchema,
  email: z.string().email('Invalid email address').optional(),
  phone: z
    .string()
    .refine(
      (phone) =>
        /^(?:\+213|0)(5|6|7)\d{8}$/.test(phone) || // algerian phone format
        /^\+?[1-9]\d{1,14}$/.test(phone), // International E.164 format
      {
        message:
          'Invalid phone number. Must be a valid Algerian or international number.'
      }
    )
    .optional(),
  country: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  zip: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code')
    .optional(),
  label: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  rc: z.string().optional(),
  mf: z.string().optional(),
  ai: z.string().optional(),
  nif: z.string().optional(),
  nis: z.string().optional(),
  na: z.string().optional(),
  quantity: positiveNumberFromString('Quantity'),
  orderType: z.string(),
  buildType: z.string(),
  coolingSystem: z.string(),
  packaging: z.string(),
  isModificationRequired: z.boolean().default(false).optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  carType: z.string().optional(),
  fins: z.string(),
  tubePitch: positiveNumberFromString('Tube Pitch'),
  tube: z.string(),
  isLowerCollectorDeferent: z.boolean().default(false),
  collectorType: z.string().optional(),
  collectorPosition: z.string().optional(),
  collectorMaterial: z.string().optional(),
  collectorDepth: positiveNumberFromString('Collector Depth'),
  collectorWidth: positiveNumberFromString('Collector Width'),
  collectorLength: positiveNumberFromString('Collector Length'),
  lowerCollectorDepth: positiveNumberFromString('Lower Collector Depth'),
  lowerCollectorWidth: positiveNumberFromString('Lower Collector Width'),
  lowerCollectorLength: positiveNumberFromString('Lower Collector Length'),
  perforation: z.string(),
  isCollectorTinned: z.boolean().default(false).optional(),
  layersNumber: positiveNumberFromString('Layers Number'),
  coreWidth: positiveNumberFromString('Core Width'),
  coreLength: positiveNumberFromString('Core Length'),
  price: positiveNumberFromString('Price'),
  deposit: positiveNumberFromString('Deposit'),
  remaining: positiveNumberFromString('Remaining'),
  paymentMode: z.string().optional(),
  iban: z.string().optional(),
  receivingDate: z
    .string()
    .default(() => new Date().toISOString()) // the current date is the default
    .optional(),
  endDate: z
    .string()
    .optional()
    .refine((str) => !str || !isNaN(Date.parse(str)), {
      message: 'Invalid Date'
    })
})

// Define the TypeScript type from the Zod schema
export type AddOrderSchemaType = z.infer<typeof addOrderSchema>
export type InputNameType = keyof AddOrderSchemaType

interface Props {
  countries: { name: string }[]
  provinces: { name: string }[]
}

export function AddOrderDialog({ countries, provinces }: Props) {
  const defaultData = {
    isCompany: false,
    country: 'Algeria',
    province: 'Ghardia',
    city: 'Ghardia',
    orderType: 'Radiateur',
    buildType: 'Confection',
    coolingSystem: 'Eau',
    packaging: 'Carton',
    quantity: 1,
    isModificationRequired: false,
    perforation: 'Perforé',
    fins: 'Droite (Normale)',
    tubePitch: 10,
    tube: 'Étiré 7 (ET7)',
    collectorType: 'Plié',
    collectorPosition: 'Centrer',
    collectorMaterial: 'Laiton',
    collectorDepth: 1.5,
    collectorWidth: 0,
    collectorLength: 0,
    isLowerCollectorDeferent: false,
    isCollectorTinned: false,
    coreLength: 700,
    coreWidth: 500,
    paymentMode: 'Espèces',
    receivingDate: new Date().toISOString(),
    endDate: new Date().toISOString()
  } as AddOrderSchemaType
  const { refresh } = useRouter()
  const [isTransitioning, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [orderData, setOrderData] = useState<AddOrderSchemaType>(defaultData)

  const handleChange = (name: keyof AddOrderSchemaType, value: any) => {
    // Create a partial object to validate only the changed field
    const partialData = { [name]: value }
    try {
      // Validate the field against the schema
      addOrderSchema.partial().parse(partialData)
      // If valid, update the state
      setOrderData((prev) => ({
        ...prev,
        [name]: value
      }))
    } catch (error) {
      if (error instanceof z.ZodError)
        toast({
          title: 'Error Occurred!',
          description: (
            <div className="flex flex-col gap-1">{`Validation error for ${name}: ${error.errors
              .map((i) => i.message)
              .join(' ')}`}</div>
          ),
          variant: 'destructive'
        })
      else
        toast({
          title: 'Error Occurred!',
          description: (
            <div className="flex flex-col gap-1">{`Unexpected error for ${name}: ${error}`}</div>
          ),
          variant: 'destructive'
        })
    }
  }

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        console.log(orderData)
        // const { data } = await api.put('profile', {
        //   ...employeeData,
        //   dob: employeeData.dob.toISOString(),
        //   employedAt: employeeData.employedAt.toISOString()
        // })
        toast({
          title: 'Succès!',
          description: (
            <p>Vous avez ajouté une nouvelle commande avec succès ! </p>
          )
        })
        // reset form
        setOrderData(defaultData)
        // close form
        setOpen(false)
        // return to first step
        setCurrentStep(1)
        // refresh route
        refresh()
      } catch (error: any) {
        toast({
          title: 'Error Occurred!',
          description: <p>{error.response.data.error}</p>,
          variant: 'destructive'
        })
      }
    })
  }

  const steps = [
    { title: 'Client', completed: currentStep > 1 },
    { title: 'Fabrication', completed: currentStep > 2 },
    { title: 'Technique', completed: currentStep > 3 },
    { title: 'Payment', completed: currentStep > 4 }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="">
        <DialogTrigger asChild>
          <Button className="flex gap-3 items-center justify-center ">
            <Icons.packagePlus className="w-6 h-6" />
            {'Ajouter'}
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        // onPointerDownOutside={(e) => e.preventDefault()}
        className="w-full lg:max-w-6xl md:max-w-3xl pt-7 pb-10"
      >
        <StepIndicator steps={steps} currentStep={currentStep} />
        {currentStep === 1 && (
          <ScrollArea className="max-h-[70vh]">
            <ClientInfoForm
              countries={countries}
              provinces={provinces}
              handleChange={handleChange}
              data={orderData}
            />
          </ScrollArea>
        )}
        {currentStep === 2 && (
          <ScrollArea className="max-h-[70vh]">
            <FabricationForm data={orderData} onChange={handleChange} />
          </ScrollArea>
        )}
        {currentStep === 3 && (
          <ScrollArea className="max-h-[70vh]">
            <TechnicalDataForm data={orderData} onChange={handleChange} />
          </ScrollArea>
        )}
        {currentStep === 4 && (
          <ScrollArea className="max-h-[70vh]">
            <PaymentForm data={orderData} onChange={handleChange} />
          </ScrollArea>
        )}
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            <Icons.arrowRight className="w-auto h-4 rotate-180 mr-2" />
            {'Précédent'}
          </Button>
          {currentStep < 4 ? (
            <Button
              onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
            >
              {'Suivant'}
              <Icons.arrowRight className="w-auto h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>Soumettre</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
