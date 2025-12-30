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

export interface ReceiptItem {
  purchaseOrderItemId?: string | null
  itemId: string | null
  quantityReceived: number | null
  condition: string | null
  notes: string | null
}

export type ProcurementItemOption = {
  id: string
  name: string
  sku?: string | null
  unit?: string | null
  description?: string | null
}

interface ReceiptItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: ReceiptItem | null
  onSave: (item: ReceiptItem) => void
  itemsOptions: ProcurementItemOption[]
}

const emptyItem: ReceiptItem = {
  purchaseOrderItemId: null,
  itemId: null,
  quantityReceived: null,
  condition: '',
  notes: ''
}

const toNullableNumber = (value: string) => {
  if (value === '') return null
  const numeric = Number(value)
  return Number.isNaN(numeric) ? null : numeric
}

export function ReceiptItemDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
  itemsOptions
}: ReceiptItemDialogProps) {
  const [draftItem, setDraftItem] = React.useState<ReceiptItem>(emptyItem)

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

  const updateDraft = React.useCallback(
    <K extends keyof ReceiptItem>(field: K, value: ReceiptItem[K]) => {
      setDraftItem((prev) => {
        const newState = { ...prev, [field]: value }

        if (field === 'itemId' && value) {
          const selected = itemLookup.get(value as string)
          if (selected && selected.description && !prev.notes) {
            newState.notes = selected.description
          }
        }

        return newState
      })
    },
    [itemLookup]
  )

  const handleSave = React.useCallback(() => {
    if (!draftItem.itemId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez selectionner un article.',
        variant: 'destructive'
      })
      return
    }

    onSave(draftItem)
    onOpenChange(false)
  }, [draftItem, onOpenChange, onSave])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>
            {initialData?.itemId ? 'Modifier Article' : 'Ajouter Article'}
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
              Quantite recue
            </label>
            <Input
              type="number"
              value={draftItem.quantityReceived ?? ''}
              onChange={(e) =>
                updateDraft('quantityReceived', toNullableNumber(e.target.value))
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">Etat</label>
            <Input
              value={draftItem.condition ?? ''}
              onChange={(e) => updateDraft('condition', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">Notes</label>
            <Input
              value={draftItem.notes ?? ''}
              onChange={(e) => updateDraft('notes', e.target.value)}
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
