'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'

type Option = string | { label: string; value: string }

interface SearchComboBoxProps {
  id?: string
  options: Option[]
  placeholder?: string
  onSelect: (value: string) => void
  className?: string
  selected?: string
  isInSideADialog?: boolean
  isLoading?: boolean
  emptyMessage?: string
  listClassName?: string
}

export function SearchComboBox({
  id,
  options = [],
  onSelect,
  className,
  selected,
  listClassName,
  placeholder = 'Sélectionner un élément...',
  isInSideADialog = false,
  isLoading = false,
  emptyMessage = 'Aucun élément trouvé.'
}: SearchComboBoxProps) {
  const [open, setOpen] = React.useState(false)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const [buttonWidth, setButtonWidth] = React.useState<number | undefined>()

  // Normalize options to {label, value} format
  const normalizedOptions = options.map((option) =>
    typeof option === 'string' ? { label: option, value: option } : option
  )

  // Find selected option
  const selectedOption = normalizedOptions.find((opt) => opt.value === selected)

  React.useEffect(() => {
    if (buttonRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        setButtonWidth(buttonRef.current?.offsetWidth)
      })
      resizeObserver.observe(buttonRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          ref={buttonRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedOption ? selectedOption.label : placeholder}
          {isLoading ? (
            <div className="border-2 border-t-transparent border-gray-300 rounded-full w-4 h-4 animate-spin ml-2" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn('p-0', className)}
        side="bottom" // Force bottom placement
        sideOffset={5} // 4px spacing from trigger
        align="start"
        style={{ width: buttonWidth ? `${buttonWidth}px` : 'auto' }}
        usePortal={!isInSideADialog}
      >
        <Command>
          <CommandInput
            placeholder={`Rechercher ${placeholder.toLowerCase()}...`}
            className="h-9"
          />
          <CommandList
            className={listClassName}
            onClick={(e) => e.stopPropagation()}
          >
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {normalizedOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label} // Search by label
                  onSelect={() => {
                    onSelect(option.value)
                    setOpen(false)
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      selected === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
