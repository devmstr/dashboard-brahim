'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Combobox } from '@/components/combobox'
import { toast } from '@/hooks/use-toast'
import { RAW_MATERIAL_UNITS_ARR } from '@/config/global'

export interface PurchaseOrderItem {
  itemId: string | null
  description: string | null
  quantity: number | null
  unit: string | null
  unitPrice: number | null
  total?: number | null
}

export type ProcurementItemOption = {
  id: string
  name: string
  sku?: string | null
  unit?: string | null
  description?: string | null
}

interface PurchaseOrderItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: PurchaseOrderItem | null
  onSave: (item: PurchaseOrderItem) => void
  itemsOptions: ProcurementItemOption[]
}

const emptyItem: PurchaseOrderItem = {
  itemId: null,
  description: '',
  quantity: null,
  unit: '',
  unitPrice: null,
  total: null
}

const toNullableNumber = (value: string) => {
  if (value === '') return null
  const numeric = Number(value)
  return Number.isNaN(numeric) ? null : numeric
}

export function PurchaseOrderItemDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
  itemsOptions
}: PurchaseOrderItemDialogProps) {
  const [draftItem, setDraftItem] =
    React.useState<PurchaseOrderItem>(emptyItem)

  React.useEffect(() => {
    if (open) {
      setDraftItem(initialData || emptyItem)
    }
  }, [open, initialData])

  const itemLookup = React.useMemo(() => {
    return new Map(itemsOptions.map((item) => [item.id, item]))
  }, [itemsOptions])

  const itemSelectOptions = React.useMemo(() => {
    return itemsOptions.map((item) => ({
      label: item.sku ? `${item.name} (${item.sku})` : item.name,
      value: item.id
    }))
  }, [itemsOptions])

  const unitSelectOptions = React.useMemo(() => {
    return RAW_MATERIAL_UNITS_ARR.map((unit) => ({
      label: unit,
      value: unit
    }))
  }, [])

  const updateDraft = React.useCallback(
    <K extends keyof PurchaseOrderItem>(field: K, value: PurchaseOrderItem[K]) => {
      setDraftItem((prev) => {
        const newState = { ...prev, [field]: value }

        if (field === 'itemId' && value) {
          const selected = itemLookup.get(value)
          if (selected) {
            if (selected.unit) newState.unit = selected.unit
            if (selected.description && !prev.description) {
              newState.description = selected.description
            }
          }
        }

        return newState
      })
    },
    [itemLookup]
  )

  const handleSave = React.useCallback(() => {
    if (!draftItem.itemId && !draftItem.description) {
      toast({
        title: 'Erreur',
        description: 'Veuillez selectionner un article ou saisir une description.',
        variant: 'destructive'
      })
      return
    }

    const quantity = draftItem.quantity ?? 0
    const unitPrice = draftItem.unitPrice ?? 0
    const total = quantity && unitPrice ? quantity * unitPrice : null

    onSave({ ...draftItem, total })
    onOpenChange(false)
  }, [draftItem, onOpenChange, onSave])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>
            {initialData?.itemId || initialData?.description
              ? 'Modifier Article'
              : 'Ajouter Article'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">Article</label>
            <div className="col-span-3">
              <Combobox
                isInSideADialog
                options={itemSelectOptions}
                selected={draftItem.itemId ?? ''}
                onSelect={(value) => updateDraft('itemId', value)}
                placeholder="Selectionner un article"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">
              Description
            </label>
            <Input
              value={draftItem.description ?? ''}
              onChange={(e) => updateDraft('description', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">Quantite</label>
            <Input
              type="number"
              value={draftItem.quantity ?? ''}
              onChange={(e) =>
                updateDraft('quantity', toNullableNumber(e.target.value))
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">Unite</label>
            <div className="col-span-3">
              <Combobox
                isInSideADialog
                options={unitSelectOptions}
                selected={draftItem.unit ?? ''}
                onSelect={(value) => updateDraft('unit', value)}
                placeholder="Selectionner une unite"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">
              Prix unitaire
            </label>
            <Input
              type="number"
              value={draftItem.unitPrice ?? ''}
              onChange={(e) =>
                updateDraft('unitPrice', toNullableNumber(e.target.value))
              }
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            {initialData ? 'Sauvegarder' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
