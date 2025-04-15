'use client'
import { ClientSchemaType } from '@/app/dashboard/timeline/add-order.dialog'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { useTransition } from 'react'
import { DialogWrapper } from './dialog-wrapper'
import { ClientInfoForm } from './new-client.form'
import { toast } from '@/hooks/use-toast'

interface AddNewClientDialogButtonProps {}

export function AddNewClientDialogButton({}: AddNewClientDialogButtonProps) {
  return (
    <DialogWrapper
      title="Ajouter un client"
      subtitle="Remplissez les informations du client"
      className="max-w-6xl"
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
      <ClientInfoForm />
    </DialogWrapper>
  )
}
