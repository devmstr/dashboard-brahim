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
import { Textarea } from '@/components/ui/textarea'
import { Combobox } from '@/components/combobox'
import { toast } from '@/hooks/use-toast'
import { RAW_MATERIAL_UNITS_ARR } from '@/config/global'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export interface ArticleItem {
  itemId: string | null
  itemName: string | null
  description: string | null
  quantity: number | null
  unit: string | null
  estimatedUnitCost: number | null
  currency: string | null
}

export type ProcurementItemOption = {
  id: string
  name: string
  sku?: string | null
  category?: string | null
  unit?: string | null
  description?: string | null
}

interface AssetArticleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: ArticleItem | null
  onSave: (item: ArticleItem) => void
  itemsOptions: ProcurementItemOption[]
}

const emptyItem: ArticleItem = {
  itemId: null,
  itemName: '',
  description: '',
  quantity: null,
  unit: '',
  estimatedUnitCost: null,
  currency: 'DZD'
}

const toNullableNumber = (value: string) => {
  if (value === '') return null
  const numeric = Number(value)
  return Number.isNaN(numeric) ? null : numeric
}

export function AssetArticleDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
  itemsOptions
}: AssetArticleDialogProps) {
  const [draftItem, setDraftItem] = React.useState<ArticleItem>(emptyItem)

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
    <K extends keyof ArticleItem>(field: K, value: ArticleItem[K]) => {
      setDraftItem((prev) => {
        const next = { ...prev, [field]: value }

        if (field === 'itemId' && value) {
          const selected = itemLookup.get(value as string)
          if (selected) {
            if (selected.unit) next.unit = selected.unit
            if (selected.description && !prev.description)
              next.description = selected.description
            if (selected.name) next.itemName = selected.name
            if (
              selected.category !== 'Matieres premieres' &&
              next.currency !== 'DZD'
            ) {
              next.currency = 'DZD'
            }
          }
        }

        return next
      })
    },
    [itemLookup]
  )

  const selectedItemCategory = draftItem.itemId
    ? itemLookup.get(draftItem.itemId)?.category ?? null
    : null
  const allowForeignCurrency = selectedItemCategory === 'Matieres premieres'

  const handleSave = React.useCallback(() => {
    if (!draftItem.itemName && !draftItem.itemId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez selectionner un article ou saisir un nom.',
        variant: 'destructive'
      })
      return
    }
    onSave(draftItem)
    onOpenChange(false)
  }, [draftItem, onOpenChange, onSave])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData?.itemId || initialData?.itemName
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
              Nom article
            </label>
            <Input
              value={draftItem.itemName ?? ''}
              onChange={(e) => updateDraft('itemName', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">
              Description
            </label>
            <Textarea
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
              Prix Unitaire
            </label>
            <Input
              type="number"
              value={draftItem.estimatedUnitCost ?? ''}
              onChange={(e) =>
                updateDraft(
                  'estimatedUnitCost',
                  toNullableNumber(e.target.value)
                )
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">Devise</label>
            <div className="col-span-3">
              <Select
                onValueChange={(value) => updateDraft('currency', value)}
                value={draftItem.currency || 'DZD'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DZD">DZD</SelectItem>
                  <SelectItem value="EUR" disabled={!allowForeignCurrency}>
                    EUR
                  </SelectItem>
                  <SelectItem value="USD" disabled={!allowForeignCurrency}>
                    USD
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
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
