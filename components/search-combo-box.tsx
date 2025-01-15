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

interface SearchComboBoxProps {
  options: string[]
  placeholder?: string
  onSelect: (value: string) => void
  className?: string
  selected: string
  isInSideADialog?: boolean
}

export function SearchComboBox({
  options = [],
  placeholder = 'Sélectionner un élément...',
  onSelect,
  className,
  selected,
  isInSideADialog = false
}: SearchComboBoxProps) {
  const [open, setOpen] = React.useState(false)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const [buttonWidth, setButtonWidth] = React.useState<number | undefined>(
    undefined
  )

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
          ref={buttonRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between whitespace-nowrap', className)}
        >
          {selected || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn('p-0', className)}
        align="start"
        sideOffset={5}
        style={{ width: buttonWidth ? `${buttonWidth}px` : 'auto' }}
        usePortal={!isInSideADialog}
      >
        <Command>
          <CommandInput
            placeholder={`Rechercher ${placeholder.toLowerCase()}...`}
            className="h-9"
          />
          <CommandList
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <CommandEmpty>Aucun élément trouvé.</CommandEmpty>
            <CommandGroup>
              {options.map((item) => (
                <CommandItem
                  key={item}
                  value={item}
                  onSelect={(e) => {
                    onSelect(item)
                    setOpen(false)
                  }}
                >
                  {item}
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      selected === item ? 'opacity-100' : 'opacity-0'
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
