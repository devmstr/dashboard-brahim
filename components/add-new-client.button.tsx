'use client'

import { Button } from '@/components/ui/button'
import { ClientSchemaType } from '@/app/dashboard/timeline/add-order.dialog'
import { Icons } from '@/components/icons'
import { DialogWrapper } from './dialog-wrapper'
import { LocationData, NewClientForm } from './new-client.form'
import { useState, useTransition } from 'react'
import { delay } from '@/lib/utils'
import { SearchComboBox } from './search-combo-box'

interface AddNewClientDialogButtonProps {
  locationData: LocationData
}

export function AddNewClientDialogButton({
  locationData
}: AddNewClientDialogButtonProps) {
  const [isLoading, beginTransition] = useTransition()

  const handleSubmit = async (data: ClientSchemaType) => {
    beginTransition(async () => {
      // handle adding new client here
      await delay(1500)
      console.log('data: ', data)
      console.log('============ done! ============')
      return
    })
  }

  return (
    <DialogWrapper
      title="Ajouter un client"
      subtitle="Remplissez les informations du client"
      trigger={
        <Button
          variant="default"
          className="flex gap-3 w-fit text-secondary hover:text-secondary/80"
          onClick={(e) => e.stopPropagation()}
        >
          <Icons.addClient className="w-6 h-6" />
          Ajouter
        </Button>
      }
    >
      <NewClientForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        locationData={locationData}
      />
    </DialogWrapper>
  )
}
