'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'

type Option = string | { label: string; value: string }

interface Props {
  id?: string
  topic?: string
  selected?: string | null
  onSelect: (value: string) => void
  options: Option[]
  disabled?: boolean
  className?: string
  placeholder?: string
  emptyMessage?: string
  isLoading?: boolean
  isInSideADialog?: boolean
  listClassName?: string
}

export function Combobox({
  id,
  onSelect,
  topic,
  selected,
  options,
  disabled = false,
  className,
  placeholder,
  emptyMessage = 'Aucun élément trouvé.',
  isLoading = false,
  isInSideADialog = false,
  listClassName,
  ...props
}: Props) {
  const [open, setOpen] = React.useState(false)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const [buttonWidth, setButtonWidth] = React.useState<number | undefined>()

  // Normalize options to {label, value} format
  const normalizedOptions = options.map((option) =>
    typeof option === 'string' ? { label: option, value: option } : option
  )

  // Find selected option
  const selectedOption = normalizedOptions.find((opt) => opt.value === selected)

  // Default placeholder based on topic if provided
  const defaultPlaceholder = topic ? `Sélectionnez un ${topic}` : 'Sélectionnez'

  const displayPlaceholder = placeholder || defaultPlaceholder

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
          className={cn('w-full justify-between', className)}
          disabled={disabled}
          {...props}
        >
          {selectedOption ? selectedOption.label : displayPlaceholder}
          {isLoading ? (
            <div className="border-2 border-t-transparent border-gray-300 rounded-full w-4 h-4 animate-spin ml-2" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        side="bottom"
        sideOffset={5}
        align="start"
        style={{ width: buttonWidth ? `${buttonWidth}px` : 'auto' }}
        // @ts-ignore - usePortal is a custom prop for dialogs
        usePortal={!isInSideADialog}
      >
        <Command>
          <CommandInput
            placeholder={`Rechercher ${displayPlaceholder.toLowerCase()}...`}
            className="h-9"
          />
          <CommandList className={listClassName}>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {normalizedOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
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
