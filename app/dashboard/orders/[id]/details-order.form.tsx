'use client'

import { toast } from '@/components/ui/use-toast'
import { useState } from 'react'
import { z } from 'zod'
import {
  AddOrderSchemaType,
  InputNameType,
  addOrderSchema
} from '../../(timeline)/add-order.dialog'
import { OrderFabricationForm } from './_components/order-fabrication.form'
import { Card } from '@/components/card'
import { OrderTechnicalDataForm } from './_components/order-technical.form'

interface Props {}

export const DetailsOrderForm: React.FC<Props> = ({}: Props) => {
  const testData = {
    isCompany: false,
    country: 'Algeria',
    province: 'Ghardia',
    city: 'Ghardia',
    orderType: 'Radiateur',
    buildType: 'Confection',
    coolingSystem: 'Eau',
    packaging: 'Carton',
    quantity: 1,
    perforation: 'Perforé',
    isModificationRequired: false,
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
  const [orderData, setOrderData] = useState<AddOrderSchemaType>(testData)
  const handleChange = (name: InputNameType, value: any) => {
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
  return (
    <div className="space-y-4">
      <Card>
        <OrderFabricationForm data={orderData} onChange={handleChange} />
      </Card>
      <Card>
        <OrderTechnicalDataForm data={orderData} onChange={handleChange} />
      </Card>
    </div>
  )
}
